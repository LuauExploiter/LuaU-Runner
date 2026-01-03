import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.luau.run.path, async (req, res) => {
    try {
      const input = api.luau.run.input.parse(req.body);
      
      // Create a temp file for the lua code
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `luau-${Date.now()}-${Math.random().toString(36).substring(7)}.lua`);
      
      await fs.promises.writeFile(tempFile, input.code);

      try {
        // Execute the Luau runtime with the temp file
        // We assume server/luau.js is the runtime and behaves like 'lua' or 'luau' CLI
        const luauPath = path.join(process.cwd(), "server", "luau.cjs");
        
        // Timeout after 5 seconds
        const { stdout, stderr } = await execAsync(`node "${luauPath}" "${tempFile}"`, {
          timeout: 5000,
          maxBuffer: 1024 * 1024, // 1MB output limit
        });

        // Store execution in history
        await storage.createSnippet({
          code: input.code,
          output: (stdout + stderr) || "<no output>",
        });

        res.json({
          output: (stdout + stderr) || "",
          error: (stdout || stderr) ? undefined : "No output produced",
        });

      } catch (execErr: any) {
        // Handle execution errors (timeouts, non-zero exit code)
        const errorMsg = execErr.stderr || execErr.message || "Execution failed";
        const stdout = execErr.stdout || "";
        
        await storage.createSnippet({
          code: input.code,
          output: `Error: ${errorMsg}\nOutput: ${stdout}`,
        });

        res.json({
          output: stdout,
          error: errorMsg,
        });
      } finally {
        // Cleanup temp file
        try {
          await fs.promises.unlink(tempFile);
        } catch (e) {
          // ignore cleanup errors
        }
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.luau.history.path, async (req, res) => {
    const history = await storage.getSnippets();
    res.json(history);
  });

  return httpServer;
}

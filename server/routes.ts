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
  // Routes removed for minimal frontend-only execution
  return httpServer;
}

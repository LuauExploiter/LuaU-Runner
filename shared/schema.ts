import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  output: text("output"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;

export const executeRequestSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
});

export type ExecuteRequest = z.infer<typeof executeRequestSchema>;

export interface ExecuteResponse {
  output: string;
  error?: string;
}

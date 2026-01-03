import { db } from "./db";
import {
  snippets,
  type InsertSnippet,
  type Snippet
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getSnippets(): Promise<Snippet[]>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
}

export class DatabaseStorage implements IStorage {
  async getSnippets(): Promise<Snippet[]> {
    return await db.select()
      .from(snippets)
      .orderBy(desc(snippets.createdAt))
      .limit(50);
  }

  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const [snippet] = await db.insert(snippets)
      .values(insertSnippet)
      .returning();
    return snippet;
  }
}

export const storage = new DatabaseStorage();

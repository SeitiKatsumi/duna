import { env } from "cloudflare:workers";
import { contentSchema, defaultContent } from "@/lib/content";
export function db() {
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  return env.DB;
}
export async function readContent() {
  const row = await db()
    .prepare("SELECT content FROM settings WHERE id=1")
    .first<{ content: string }>();
  return row ? contentSchema.parse(JSON.parse(row.content)) : defaultContent;
}

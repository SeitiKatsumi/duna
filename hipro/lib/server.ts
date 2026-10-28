import { env } from '../../deploy/runtime';
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { db } from "@/db";
export async function isAdmin() {
  const user = await getChatGPTUser();
  const emails = (env.ADMIN_EMAIL || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return !!user && emails.includes(user.email.toLowerCase());
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const protocol = req.headers.get('x-forwarded-proto')?.split(',')[0] || new URL(req.url).protocol.slice(0,-1);
  return !!origin && origin === `${protocol}://${req.headers.get('host')}`;
}
export async function rateLimit(req: Request, kind: string, max: number) {
  const day = new Date().toISOString().slice(0, 10);
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(kind + day + ip),
  );
  const key = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const now = Math.floor(Date.now() / 1000);
  await db()
    .prepare("DELETE FROM rate_limits WHERE expires < ?")
    .bind(now)
    .run();
  const row = await db()
    .prepare(
      "INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(key, now + 86400)
    .first<{ count: number }>();
  return !!row && row.count <= max;
}
export async function syncLead(id: string, payload: unknown) {
  if (!env.CRM_WEBHOOK_URL) return "pending";
  try {
    const url = new URL(env.CRM_WEBHOOK_URL);
    if (url.protocol !== "https:") throw new Error("CRM exige HTTPS");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": id,
        ...(env.CRM_WEBHOOK_TOKEN
          ? { Authorization: "Bearer " + env.CRM_WEBHOOK_TOKEN }
          : {}),
      },
      body: JSON.stringify({ event: "duna.lead.created", id, data: payload }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    await db()
      .prepare("UPDATE leads SET crm_status='sent',crm_error=NULL WHERE id=?")
      .bind(id)
      .run();
    return "sent";
  } catch {
    await db()
      .prepare(
        "UPDATE leads SET crm_status='failed',crm_error='Falha na integração. Verifique a configuração e tente novamente.' WHERE id=?",
      )
      .bind(id)
      .run();
    return "failed";
  }
}

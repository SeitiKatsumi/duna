import { db } from "@/db";
import { rateLimit, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 200) return new Response(null, { status: 413 });
    const { name } = JSON.parse(raw);
    if (
      ![
        "plans_view",
        "simulation_complete",
        "form_submitted",
        "whatsapp_click",
      ].includes(name)
    )
      return new Response(null, { status: 400 });
    if (!(await rateLimit(req, "event", 150)))
      return new Response(null, { status: 429 });
    const day = new Date().toISOString().slice(0, 10);
    await db()
      .prepare(
        "INSERT INTO events (key,day,name,count) VALUES (?,?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1",
      )
      .bind(day + ":" + name, day, name)
      .run();
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

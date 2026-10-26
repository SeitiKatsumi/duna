import { db } from "@/db";
import { leadSchema } from "@/lib/validation";
import { calculate } from "@/lib/calculator";
import { rateLimit, sameOrigin, syncLead } from "@/lib/server";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 20000)
      return Response.json(
        { error: "Solicitação muito grande." },
        { status: 413 },
      );
    const parsed = leadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return Response.json(
        { error: "Revise os campos, a data, o WhatsApp e o consentimento." },
        { status: 400 },
      );
    const p = parsed.data;
    const date = new Date(p.date + "T12:00:00Z");
    if (
      !Number.isFinite(date.valueOf()) ||
      date.toISOString().slice(0, 10) !== p.date ||
      p.date <
        new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Sao_Paulo",
        })
    )
      return Response.json(
        { error: "Informe uma data válida, a partir de hoje." },
        { status: 400 },
      );
    const prior = await db()
      .prepare("SELECT id FROM leads WHERE id=?")
      .bind(p.id)
      .first();
    if (prior) return Response.json({ ok: true });
    if (!(await rateLimit(req, "lead", 10)))
      return Response.json(
        {
          error: "Limite de solicitações atingido. Tente novamente mais tarde.",
        },
        { status: 429 },
      );
    const { website: _, ...safe } = p;
    void _;
    const payload = {
      ...safe,
      equipment: "HIPRO",
      source: "landing-duna",
      calculation: p.scenario ? calculate(p.scenario) : null,
      privacyVersion: "2026-10-02",
      createdAt: new Date().toISOString(),
    };
    await db()
      .prepare(
        "INSERT INTO leads (id,created_at,payload,crm_status,status) VALUES (?,?,?,'pending','novo')",
      )
      .bind(p.id, payload.createdAt, JSON.stringify(payload))
      .run();
    await syncLead(p.id, payload);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json({ error: "Formato inválido." }, { status: 400 });
    console.error("Lead persistence failed");
    return Response.json(
      {
        error:
          "Não foi possível registrar. Seus campos foram preservados; tente novamente.",
      },
      { status: 503 },
    );
  }
}

import { db } from "@/db";
import { contentSchema } from "@/lib/content";
import { isAdmin, sameOrigin, syncLead } from "@/lib/server";
export async function GET() {
  if (!(await isAdmin()))
    return Response.json({ error: "Acesso restrito." }, { status: 403 });
  try {
    const leads = await db()
      .prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200")
      .all();
    const events = await db()
      .prepare(
        "SELECT name,SUM(count) AS total FROM events WHERE day>=date('now','-30 days') GROUP BY name",
      )
      .all();
    return Response.json(
      { leads: leads.results, events: events.results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Não foi possível carregar." },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await isAdmin()))
    return Response.json({ error: "Acesso restrito." }, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 100000)
      return Response.json(
        { error: "Conteúdo muito grande." },
        { status: 413 },
      );
    const body = JSON.parse(raw);
    if (body.action === "save") {
      const parsed = contentSchema.safeParse(body.content);
      if (!parsed.success)
        return Response.json(
          {
            error: parsed.error.issues
              .map((x) => x.path.join(".") + ": " + x.message)
              .join("; "),
          },
          { status: 400 },
        );
      if (
        parsed.data.competitionEnabled &&
        !parsed.data.competitionTerms.trim()
      )
        return Response.json(
          { error: "Informe os critérios da campanha." },
          { status: 400 },
        );
      await db()
        .prepare(
          "INSERT INTO settings (id,content,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content,updated_at=excluded.updated_at",
        )
        .bind(JSON.stringify(parsed.data), new Date().toISOString())
        .run();
      return Response.json({ ok: true });
    }
    if (
      body.action === "status" &&
      typeof body.id === "string" &&
      ["novo", "em_atendimento", "proposta", "concluido"].includes(body.status)
    ) {
      await db()
        .prepare("UPDATE leads SET status=? WHERE id=?")
        .bind(body.status, body.id)
        .run();
      return Response.json({ ok: true });
    }
    if (body.action === "retry" && typeof body.id === "string") {
      const lead = await db()
        .prepare("SELECT payload,crm_status FROM leads WHERE id=?")
        .bind(body.id)
        .first<{ payload: string; crm_status: string }>();
      if (!lead)
        return Response.json(
          { error: "Contato não encontrado." },
          { status: 404 },
        );
      if (lead.crm_status === "sent")
        return Response.json({ ok: true, status: "sent" });
      return Response.json({
        ok: true,
        status: await syncLead(body.id, JSON.parse(lead.payload)),
      });
    }
    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch {
    return Response.json(
      { error: "Não foi possível salvar. Revise os dados e tente novamente." },
      { status: 503 },
    );
  }
}

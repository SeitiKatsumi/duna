"use client";
import { useState, type FormEvent } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { type Content } from "@/lib/content";
type Lead = {
  id: string;
  created_at: string;
  payload: string;
  crm_status: string;
  crm_error: string | null;
  status: string;
};
export default function Admin({ initial }: { initial: Content }) {
  const [c, setC] = useState(initial),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [leads, setLeads] = useState<Lead[]>([]),
    [events, setEvents] = useState<{ name: string; total: number }[]>([]);
  async function call(data: unknown) {
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const b = (await r.json()) as { error?: string; status?: string };
    if (!r.ok) throw new Error(b.error || "Falha na operação");
    return b;
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await call({ action: "save", content: c });
      setMessage("Conteúdo salvo. A página pública já utiliza as alterações.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function load() {
    try {
      const r = await fetch("/api/admin");
      const b = (await r.json()) as {
        error?: string;
        leads: Lead[];
        events: { name: string; total: number }[];
      };
      if (!r.ok) throw new Error(b.error);
      setLeads(b.leads);
      setEvents(b.events);
    } catch {
      setMessage("Não foi possível carregar os contatos.");
    }
  }
  function download(name: string, data: unknown) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  function field(key: keyof Content, label: string, multiline = false) {
    return (
      <label key={key}>
        {label}
        {multiline ? (
          <textarea
            value={String(c[key])}
            onChange={(e) => setC({ ...c, [key]: e.target.value })}
          />
        ) : (
          <input
            value={String(c[key])}
            onChange={(e) => setC({ ...c, [key]: e.target.value })}
          />
        )}
      </label>
    );
  }
  return (
    <main className="admin">
      <a href="/">Duna Equipamentos · Ver site</a>
      <h1>Administração</h1>
      <p>Edite os conteúdos e acompanhe as solicitações de locação.</p>
      <div className="admin-toolbar">
        <button
          className="button outline small"
          onClick={() => download("duna-conteudo.json", c)}
        >
          Backup dos conteúdos
        </button>
        <a className="text-link" href="/signout-with-chatgpt?return_to=/">
          Sair
        </a>
      </div>
      <p role="status" className="admin-status">
        {message}
      </p>
      <Tabs defaultValue="content">
        <TabsList className="admin-tabs">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="faq">Perguntas</TabsTrigger>
          <TabsTrigger value="leads" onClick={load}>
            Contatos
          </TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        <form onSubmit={save}>
          <TabsContent value="content">
            <section className="admin-section">
              <h2>Texto e identidade</h2>
              <div className="admin-grid">
                {field(
                  "headline",
                  "Título principal (uma linha por trecho)",
                  true,
                )}
                {field("subtitle", "Texto de abertura", true)}
                {field("technologyTitle", "Título da tecnologia", true)}
                {field(
                  "technologyDescription",
                  "Descrição da tecnologia",
                  true,
                )}
                {field("about", "Apresentação da Duna", true)}
                {field("equipmentVersion", "Versão e aplicadores disponíveis")}
                {field(
                  "heroImage",
                  "Imagem de abertura (URL HTTPS ou /images/...)",
                )}
                {field(
                  "technologyImage",
                  "Imagem da tecnologia (URL HTTPS ou /images/...)",
                )}
                {field("videoUrl", "Link HTTPS de vídeo autorizado (opcional)")}
              </div>
              <p className="helper">
                Use imagens autorizadas e otimizadas. Os endereços são aplicados
                diretamente no site.
              </p>
            </section>
          </TabsContent>
          <TabsContent value="plans">
            {c.plans.map((plan, i) => (
              <section className="admin-section" key={plan.id}>
                <h2>{plan.name}</h2>
                <div className="admin-grid">
                  {(
                    [
                      ["name", "Nome"],
                      ["description", "Descrição"],
                      ["period", "Período e frequência"],
                      ["version", "Versão e aplicadores"],
                      ["limits", "Limites de utilização"],
                      ["materials", "Materiais e consumíveis"],
                      ["delivery", "Entrega e retirada"],
                      ["support", "Suporte e orientação"],
                      ["cancellation", "Reserva, cancelamento e reagendamento"],
                      ["unit", "Unidade de cobrança"],
                      ["payment", "Formas de pagamento"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={plan[key]}
                        onChange={(e) =>
                          setC({
                            ...c,
                            plans: c.plans.map((p, j) =>
                              j === i ? { ...p, [key]: e.target.value } : p,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Preço (vazio = sob consulta)
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      step=".01"
                      value={plan.price ?? ""}
                      onChange={(e) =>
                        setC({
                          ...c,
                          plans: c.plans.map((p, j) =>
                            j === i
                              ? {
                                  ...p,
                                  price:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }
                              : p,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              </section>
            ))}
          </TabsContent>
          <TabsContent value="faq">
            {c.faq.map((faq, i) => (
              <section className="admin-section" key={i}>
                <div className="admin-grid">
                  <label>
                    Pergunta
                    <input
                      value={faq.question}
                      onChange={(e) =>
                        setC({
                          ...c,
                          faq: c.faq.map((f, j) =>
                            j === i ? { ...f, question: e.target.value } : f,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Resposta
                    <textarea
                      value={faq.answer}
                      onChange={(e) =>
                        setC({
                          ...c,
                          faq: c.faq.map((f, j) =>
                            j === i ? { ...f, answer: e.target.value } : f,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className="text-link"
                  type="button"
                  disabled={c.faq.length === 1}
                  onClick={() =>
                    setC({ ...c, faq: c.faq.filter((_, j) => i !== j) })
                  }
                >
                  Remover pergunta
                </button>
              </section>
            ))}
            <button
              className="button outline small"
              type="button"
              disabled={c.faq.length >= 20}
              onClick={() =>
                setC({
                  ...c,
                  faq: [
                    ...c.faq,
                    { question: "Nova pergunta", answer: "Nova resposta" },
                  ],
                })
              }
            >
              Adicionar pergunta
            </button>
          </TabsContent>
          <TabsContent value="settings">
            <section className="admin-section">
              <h2>Atendimento e dados institucionais</h2>
              <div className="admin-grid">
                {field(
                  "whatsapp",
                  "WhatsApp (55 + DDD + número, somente dígitos)",
                )}
                {field("serviceArea", "Área de atendimento")}
                {field("legalName", "Razão social / identificação jurídica")}
                {field("legalEmail", "E-mail de privacidade")}
              </div>
            </section>
            <section className="admin-section">
              <h2>Campanha de concorrência</h2>
              <label className="check-row">
                <Checkbox
                  checked={c.competitionEnabled}
                  onCheckedChange={(v) =>
                    setC({ ...c, competitionEnabled: v === true })
                  }
                />
                Exibir “Cobrimos qualquer concorrência”
              </label>
              {field(
                "competitionTerms",
                "Critérios obrigatórios da campanha",
                true,
              )}
              <p className="helper">
                Ative apenas após aprovação das condições comerciais.
              </p>
            </section>
            <section className="admin-section">
              <h2>Calculadora</h2>
              <div className="admin-grid">
                <label>
                  Dias iniciais
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={c.calculator.days}
                    onChange={(e) =>
                      setC({
                        ...c,
                        calculator: {
                          ...c.calculator,
                          days: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Áreas (uma por linha)
                  <textarea
                    value={c.calculator.procedures.join("\n")}
                    onChange={(e) =>
                      setC({
                        ...c,
                        calculator: {
                          ...c.calculator,
                          procedures: e.target.value.split("\n"),
                        },
                      })
                    }
                  />
                </label>
              </div>
            </section>
            <section className="admin-section">
              <h2>Integrações</h2>
              <p>
                WhatsApp é configurado acima. O CRM exige CRM_WEBHOOK_URL e
                CRM_WEBHOOK_TOKEN na hospedagem. O agente usa DUNA_AGENT_URL. O
                acesso administrativo exige ADMIN_EMAIL. Não insira credenciais
                nos textos do site.
              </p>
              <p className="helper">
                A integração envia o evento duna.lead.created. Configure um
                endpoint compatível com o contrato documentado no README; a
                integração nativa Elevenmind requer a documentação do
                fornecedor.
              </p>
            </section>
          </TabsContent>
          <div className="admin-toolbar">
            <button type="submit" className="button" disabled={busy}>
              {busy ? "Salvando..." : "Salvar alterações"}
            </button>
            <span className="helper">
              Preços e conteúdo são persistidos no banco de dados.
            </span>
          </div>
        </form>
        <TabsContent value="leads">
          <div className="admin-toolbar">
            <button className="button small" onClick={load}>
              Atualizar contatos
            </button>
            <button
              className="button outline small"
              onClick={() => download("duna-contatos.json", leads)}
            >
              Exportar contatos carregados
            </button>
          </div>
          <p className="helper">
            Até 200 solicitações recentes. Preserve estes dados: o arquivo
            contém informações pessoais.
          </p>
          <div className="admin-section">
            <h3>Medição dos últimos 30 dias</h3>
            {events.length ? (
              events.map((e) => (
                <p key={e.name}>
                  {e.name}: {e.total}
                </p>
              ))
            ) : (
              <p>Nenhum evento consentido registrado.</p>
            )}
          </div>
          {!leads.length && <p>Nenhuma solicitação carregada.</p>}
          {leads.map((lead) => {
            const data = JSON.parse(lead.payload);
            return (
              <article className="lead-card" key={lead.id}>
                <h3>
                  {data.name} · {data.clinic}
                </h3>
                <p>
                  {data.phone} · {data.location} ·{" "}
                  {new Date(lead.created_at).toLocaleString("pt-BR")}
                </p>
                <p className="helper">
                  CRM:{" "}
                  {lead.crm_status === "sent"
                    ? "enviado"
                    : lead.crm_status === "failed"
                      ? "falha no envio"
                      : "aguardando integração"}{" "}
                  {lead.crm_error}
                </p>
                <div className="admin-toolbar">
                  <Select
                    value={lead.status}
                    onValueChange={async (status) => {
                      try {
                        await call({ action: "status", id: lead.id, status });
                        await load();
                      } catch {
                        setMessage("Falha ao alterar etapa.");
                      }
                    }}
                  >
                    <SelectTrigger aria-label={"Etapa de " + data.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["novo", "em_atendimento", "proposta", "concluido"].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s.replaceAll("_", " ")}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {lead.crm_status !== "sent" && (
                    <button
                      className="button outline small"
                      onClick={async () => {
                        try {
                          const r = await call({
                            action: "retry",
                            id: lead.id,
                          });
                          setMessage(
                            r.status === "pending"
                              ? "Configure o endpoint do CRM antes de reenviar."
                              : r.status === "sent"
                                ? "Contato enviado ao CRM."
                                : "O CRM não confirmou o recebimento.",
                          );
                          await load();
                        } catch {
                          setMessage("Falha ao reenviar.");
                        }
                      }}
                    >
                      Reenviar ao CRM
                    </button>
                  )}
                </div>
                <details>
                  <summary>Ver solicitação e simulação</summary>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </details>
              </article>
            );
          })}
        </TabsContent>
      </Tabs>
    </main>
  );
}

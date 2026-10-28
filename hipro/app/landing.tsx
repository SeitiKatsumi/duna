"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  MapPin,
  AudioLines,
  Layers3,
  SlidersHorizontal,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Plus,
  Trash2,
  MessageCircle,
  ShieldCheck,
  Menu,
  X,
  Play,
  Activity,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type Content } from "@/lib/content";
import { calculate, type Scenario } from "@/lib/calculator";
import { scenarioSchema } from "@/lib/validation";
const money = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function track(name: string) {
  if (localStorage.getItem("duna-cookies") === "accepted")
    void fetch("/hipro/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
}
function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default function Landing({
  content: c,
  agentUrl,
}: {
  content: Content;
  agentUrl: string;
}) {
  const [menu, setMenu] = useState(false);
  const [rows, setRows] = useState([
    { area: c.calculator.procedures[0], quantity: 4, price: 600 },
  ]);
  const [days, setDays] = useState(c.calculator.days),
    [rental, setRental] = useState(""),
    [other, setOther] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Ainda não defini"),
    [includeScenario, setIncludeScenario] = useState(false);
  const [consent, setConsent] = useState(false),
    [sending, setSending] = useState(false),
    [feedback, setFeedback] = useState(""),
    [success, setSuccess] = useState(false);
  const [cookies, setCookies] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const scenario: Scenario = {
    rows,
    days,
    rental: rental === "" ? null : Number(rental),
    other: other === "" ? null : Number(other),
  };
  let result: ReturnType<typeof calculate> | null = null;
  try {
    result = calculate(scenario);
  } catch {}
  useEffect(() => {
    const stored = localStorage.getItem("duna-cookies");
    queueMicrotask(() => setCookies(stored || "pending"));
    const target = document.getElementById("planos");
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        track("plans_view");
        observer.disconnect();
      }
    });
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "configure_hipro_simulation",
          title: "Simular locação HIPRO",
          description:
            "Atualiza a simulação visível; não envia contato nem reserva.",
          inputSchema: {
            type: "object",
            properties: {
              rows: {
                type: "array",
                minItems: 1,
                maxItems: 12,
                items: {
                  type: "object",
                  properties: {
                    area: { type: "string" },
                    quantity: { type: "integer", minimum: 0, maximum: 10000 },
                    price: { type: "number", minimum: 0, maximum: 1000000 },
                  },
                  required: ["area", "quantity", "price"],
                },
              },
              days: { type: "integer", minimum: 1, maximum: 365 },
              rental: { type: ["number", "null"], minimum: 0 },
              other: { type: ["number", "null"], minimum: 0 },
            },
            required: ["rows", "days", "rental", "other"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: async (input: unknown) => {
            const s = scenarioSchema.parse(input);
            const r = calculate(s);
            setRows(s.rows);
            setDays(s.days);
            setRental(s.rental === null ? "" : String(s.rental));
            setOther(s.other === null ? "" : String(s.other));
            document.getElementById("simulador")?.scrollIntoView();
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
            return r;
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, []);
  function proposal(plan?: string, withScenario = false) {
    if (plan) setSelectedPlan(plan);
    setIncludeScenario(withScenario);
    setSuccess(false);
    setFeedback("");
    if (withScenario) track("simulation_complete");
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  }
  function updateRow(index: number, key: string, value: string | number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) return;
    const form = new FormData(e.currentTarget);
    setSending(true);
    setFeedback("");
    requestId.current ??= crypto.randomUUID();
    const utm: Record<string, string> = {};
    if (localStorage.getItem("duna-cookies") === "accepted")
      for (const [k, v] of new URLSearchParams(location.search))
        if (
          [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_content",
            "utm_term",
          ].includes(k)
        )
          utm[k] = v.slice(0, 250);
    try {
      const response = await fetch("/hipro/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(form),
          id: requestId.current,
          plan: selectedPlan,
          consent,
          scenario: includeScenario ? scenario : null,
          utm,
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(body.error || "Não foi possível enviar.");
      setSuccess(true);
      setFeedback(
        "Solicitação registrada. A equipe confirmará disponibilidade e condições antes da reserva.",
      );
      track("form_submitted");
      requestId.current = null;
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar. Tente novamente.",
      );
    } finally {
      setSending(false);
    }
  }
  function cookieChoice(value: string) {
    localStorage.setItem("duna-cookies", value);
    setCookies(value);
  }
  const whatsapp = c.whatsapp
    ? "https://wa.me/" +
      c.whatsapp +
      "?text=" +
      encodeURIComponent(
        "Olá! Tenho interesse na locação do HIPRO em Brasília. Plano: " +
          selectedPlan +
          (includeScenario && result
            ? ". Simulação: " + JSON.stringify({ ...scenario, result })
            : ""),
      )
    : "";
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="header">
        <a href="/" aria-label="Duna Equipamentos, início">
          <img
            className="logo"
            src="/hipro/images/duna-logo.webp"
            alt="Duna Equipamentos"
            width="108"
            height="78"
          />
        </a>
        <nav className={menu ? "is-open" : ""} aria-label="Navegação principal">
          {[
            ["tecnologia", "O HIPRO"],
            ["aplicacoes", "Aplicações"],
            ["simulador", "Simule seu retorno"],
            ["planos", "Planos"],
          ].map(([id, label]) => (
            <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="button small header-cta" href="#contato">
          Fale com a Duna
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="conteudo">
        <section className="hero">
          <img
            className="hero-photo"
            src={c.heroImage}
            alt="Equipamento HIPRO disponibilizado para consulta de locação"
            width="1672"
            height="941"
            fetchPriority="high"
          />
          <div className="hero-content">
            <span className="eyebrow">
              <MapPin size={14} /> LOCAÇÃO HIPRO · BRASÍLIA
            </span>
            <h1>
              {c.headline.split("\n").map((line, i) => (
                <span className={i === 2 ? "muted" : ""} key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="preserve-lines">{c.subtitle}</p>
            <div className="actions">
              <a className="button" href="#planos">
                Conhecer os planos
              </a>
              <a className="text-link" href="#simulador">
                Simular meu retorno
              </a>
            </div>
            <div className="hero-foot">
              <span>TECNOLOGIA HIPRO</span>
              <i />
              <span>CUIDADO DUNA</span>
            </div>
          </div>
          <div className="product-label">
            <b>
              HIPRO<sup>®</sup>
            </b>
            <span>Precisão em cada possibilidade.</span>
          </div>
        </section>
        <div className="feature-strip">
          <span>
            <AudioLines />
            Ultrassom micro e macrofocado
          </span>
          <span>
            <Layers3 />
            Tecnologia sem cartuchos
          </span>
          <span>
            <SlidersHorizontal />
            Controle digital de profundidade
          </span>
          <span>
            <MapPin />
            Locação em Brasília
          </span>
        </div>
        <section className="section technology" id="tecnologia">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / CONHEÇA O HIPRO</span>
              <h2 className="preserve-lines">{c.technologyTitle}</h2>
            </div>
            <p>{c.technologyDescription}</p>
          </div>
          <div className="technology-grid">
            <div className="dark-product">
              <img
                src={c.technologyImage}
                alt="Detalhe do HIPRO HOF, com tela e aplicador"
                width="1672"
                height="941"
                loading="lazy"
              />
              <div>
                <span className="eyebrow">TECNOLOGIA EM FOCO</span>
                <b>
                  HIPRO<sup>®</sup>
                </b>
                <span>{c.equipmentVersion}</span>
              </div>
              {c.videoUrl && (
                <a
                  className="video-link"
                  href={c.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={16} /> Conheça em vídeo
                </a>
              )}
            </div>
            <div className="tech-list">
              {[
                [
                  Layers3,
                  "Sem cartuchos",
                  "Uma tecnologia desenvolvida para simplificar a rotina de aplicação.",
                ],
                [
                  SlidersHorizontal,
                  "Precisão digital",
                  "O sistema DDC permite o controle eletrônico da profundidade.",
                ],
                [
                  Activity,
                  "Protocolos personalizados",
                  "Parâmetros definidos por profissional habilitado, de acordo com a avaliação.",
                ],
                [
                  AudioLines,
                  "Aplicação ergonômica",
                  "Um aplicador projetado para dar flexibilidade aos atendimentos.",
                ],
              ].map(([Icon, title, description]) => {
                const I = Icon as typeof Layers3;
                return (
                  <div className="tech-item" key={String(title)}>
                    <I size={24} />
                    <div>
                      <h3>{String(title)}</h3>
                      <p>{String(description)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="technical-note">
            Características gerais da linha HIPRO, conforme{" "}
            <a
              href="https://contourline.com.br/invista-no-ultrassom-microfocado-mais-rentavel-do-brasil-hipro/"
              target="_blank"
              rel="noreferrer"
            >
              documentação do fabricante
            </a>
            . Versão, aplicadores e indicações disponíveis serão confirmados na
            proposta.
          </p>
        </section>
        <section className="applications-wrap" id="aplicacoes">
          <div className="section applications">
            <div>
              <span className="eyebrow">
                02 / NOVAS POSSIBILIDADES DE CUIDADO
              </span>
              <h2>
                Mais possibilidades.
                <br />
                <span>O mesmo olhar cuidadoso.</span>
              </h2>
              <p>
                Explore aplicações da tecnologia, sempre com avaliação e
                indicação de um profissional habilitado.
              </p>
            </div>
            <Tabs defaultValue="face" className="application-tabs">
              <TabsList className="area-tabs">
                <TabsTrigger value="face">Face</TabsTrigger>
                <TabsTrigger value="pescoco">Pescoço e papada</TabsTrigger>
                <TabsTrigger value="corpo">Corpo</TabsTrigger>
              </TabsList>
              <TabsContent value="face">
                <span className="large-index">01</span>
                <h3>Firmeza e contorno facial</h3>
                <p>
                  Possibilidades voltadas ao estímulo de colágeno, à flacidez e
                  à aparência de rugas e linhas finas.
                </p>
              </TabsContent>
              <TabsContent value="pescoco">
                <span className="large-index">02</span>
                <h3>Cuidado que vai além da face</h3>
                <p>
                  Avaliação de flacidez e contorno na região do pescoço e da
                  papada, conforme a indicação e o aplicador.
                </p>
              </TabsContent>
              <TabsContent value="corpo">
                <span className="large-index">03</span>
                <h3>Aplicações corporais sob consulta</h3>
                <p>
                  As possibilidades corporais dependem da versão do HIPRO e dos
                  aplicadores contratados. Consulte a compatibilidade com a
                  Duna.
                </p>
              </TabsContent>
              <small>
                Protocolos e resultados variam. O equipamento deve ser operado
                por profissional habilitado.
              </small>
            </Tabs>
          </div>
        </section>
        <section className="section rental-benefits">
          <span className="eyebrow">03 / SUA CLÍNICA, UM PASSO À FRENTE</span>
          <div className="section-heading">
            <h2>
              Invista nas possibilidades.
              <br />
              <span>Sem comprar o equipamento.</span>
            </h2>
            <p>
              A tecnologia acompanha sua agenda.
              <br />A Duna acompanha você.
            </p>
          </div>
          <div className="benefit-grid">
            {[
              [
                ChartNoAxesCombined,
                "Amplie seu portfólio",
                "Inclua novas possibilidades de atendimento sem o investimento na compra.",
              ],
              [
                CalendarDays,
                "Planeje sua agenda",
                "Consulte formatos de locação conforme a frequência de uso da sua clínica.",
              ],
              [
                MessageCircle,
                "Conte com a Duna",
                "Atendimento próximo para entender sua necessidade e construir uma proposta.",
              ],
            ].map(([Icon, title, description]) => {
              const I = Icon as typeof ChartNoAxesCombined;
              return (
                <article key={String(title)}>
                  <I size={29} />
                  <h3>{String(title)}</h3>
                  <p>{String(description)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="calculator-wrap" id="simulador">
          <div className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">04 / PLANEJE SEU PRÓXIMO PASSO</span>
                <h2>
                  O potencial da sua agenda.
                  <br />
                  <span>Na ponta do lápis.</span>
                </h2>
              </div>
              <p>
                Simule atendimentos, informe seus custos e visualize o resultado
                estimado para o período.
              </p>
            </div>
            <div className="calculator">
              <div className="calculator-input">
                <div className="panel-heading">
                  <h3>Monte seu cenário</h3>
                  <span>01 / SIMULAÇÃO</span>
                </div>
                <p className="helper">
                  Valores iniciais ilustrativos. Edite conforme sua realidade.
                  Quantidades para o período inteiro.
                </p>
                <div className="procedure-labels">
                  <span>Procedimento / área</span>
                  <span>Atendimentos</span>
                  <span>Valor por atendimento</span>
                  <span />
                </div>
                {rows.map((row, index) => (
                  <div className="procedure-row" key={index}>
                    <Choice
                      label={"Área " + (index + 1)}
                      value={row.area}
                      onChange={(v) => updateRow(index, "area", v)}
                      options={[
                        ...new Set([...c.calculator.procedures, row.area]),
                      ]}
                    />
                    <input
                      aria-label={"Atendimentos " + (index + 1)}
                      type="number"
                      min="0"
                      max="10000"
                      step="1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(
                          index,
                          "quantity",
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                    <div className="money-input">
                      <span>R$</span>
                      <input
                        aria-label={"Valor por atendimento " + (index + 1)}
                        type="number"
                        min="0"
                        max="1000000"
                        step=".01"
                        value={row.price}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "price",
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <button
                      className="icon-button"
                      aria-label={"Remover procedimento " + (index + 1)}
                      disabled={rows.length === 1}
                      onClick={() =>
                        setRows(rows.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  className="add-row"
                  disabled={rows.length >= 12}
                  onClick={() =>
                    setRows([
                      ...rows,
                      {
                        area: c.calculator.procedures[0],
                        quantity: 0,
                        price: 0,
                      },
                    ])
                  }
                >
                  <Plus size={16} />
                  Adicionar procedimento
                </button>
                <div className="cost-fields">
                  <label>
                    Dias de utilização
                    <input
                      type="number"
                      min="1"
                      max="365"
                      step="1"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Locação por dia (R$)
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      step=".01"
                      placeholder="Informe o custo"
                      value={rental}
                      onChange={(e) => setRental(e.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    Outros custos no período (R$)
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      step=".01"
                      placeholder="Equipe, materiais, taxas... Informe 0 se não houver."
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                    />
                  </label>
                </div>
                <p className="helper">
                  Locação total = custo por dia × dias. Se recebeu um valor
                  fechado, divida pelo número de dias.
                </p>
              </div>
              <div className="calculator-result" aria-live="polite">
                <span className="eyebrow">SEU CENÁRIO ESTIMADO</span>
                <p>Faturamento bruto</p>
                <strong>{result ? money(result.gross) : "—"}</strong>
                <div className="result-line">
                  <span>Custos informados</span>
                  <b>
                    {result?.costs !== null && result
                      ? money(result.costs)
                      : "A informar"}
                  </b>
                </div>
                <div className="result-net">
                  <span>Resultado após os custos informados</span>
                  <b>
                    {result?.result !== null && result
                      ? money(result.result)
                      : "—"}
                  </b>
                </div>
                <div className="result-small">
                  <div>
                    <span>Margem estimada</span>
                    <b>
                      {result?.margin !== null && result
                        ? result.margin.toFixed(1) + "%"
                        : "—"}
                    </b>
                  </div>
                  <div>
                    <span>Ponto de equilíbrio</span>
                    <b>
                      {result?.breakEven !== null && result
                        ? result.breakEven + " atend."
                        : "—"}
                    </b>
                  </div>
                </div>
                <p className="result-note">
                  {!result
                    ? "Revise os campos: use valores positivos e quantidades inteiras."
                    : result.costs === null
                      ? "Informe a locação e os outros custos para estimar o resultado."
                      : "Ponto de equilíbrio considera o ticket médio e a mesma proporção de procedimentos; custos do período são tratados como fixos."}
                </p>
                <button
                  className="button light"
                  disabled={!result}
                  onClick={() => proposal(undefined, true)}
                >
                  Receber proposta para este cenário
                </button>
                <small>
                  Simulação sem garantia de retorno. Receita bruta não é lucro.
                  Inclua todos os custos relevantes.
                </small>
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="planos">
          <div className="center-heading">
            <span className="eyebrow">05 / ESCOLHA COMO EVOLUIR</span>
            <h2>Um plano para cada agenda.</h2>
            <p>Flexibilidade para começar. Proximidade para continuar.</p>
          </div>
          <div className="plans">
            {c.plans.map((plan, i) => (
              <article
                className={"plan " + (i === 1 ? "featured" : "")}
                key={plan.id}
              >
                {i === 1 && <span className="plan-badge">PARA SUA ROTINA</span>}
                <span className="plan-index">0{i + 1}</span>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <div className="plan-price">
                  {plan.price === null ? "Sob consulta" : money(plan.price)}
                  {plan.price !== null && <small>{plan.unit}</small>}
                </div>
                <ul>
                  {[plan.period, plan.version, plan.delivery, plan.support].map(
                    (s, j) => (
                      <li key={j}>
                        <Check size={15} />
                        {s}
                      </li>
                    ),
                  )}
                </ul>
                <button
                  className={"button " + (i === 1 ? "" : "outline")}
                  onClick={() => proposal(plan.name)}
                >
                  Solicitar proposta
                </button>
                <details>
                  <summary>Ver condições do plano</summary>
                  <dl>
                    {[
                      ["Utilização", plan.limits],
                      ["Materiais", plan.materials],
                      ["Reserva e alterações", plan.cancellation],
                      ["Pagamento", plan.payment],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </article>
            ))}
          </div>
          <p className="center-note">
            Disponibilidade, valores e condições confirmados em proposta. A
            solicitação não garante a reserva.
          </p>
          {c.competitionEnabled && (
            <div className="competition">
              <div>
                <span className="eyebrow">UMA PROPOSTA PARA CONVERSAR</span>
                <h3>Cobrimos qualquer concorrência*</h3>
                <p>
                  {c.competitionTerms ||
                    "Condição sujeita à análise comercial. Solicite os critérios à equipe."}
                </p>
              </div>
              <button
                className="button"
                onClick={() => proposal("Análise de proposta concorrente")}
              >
                Encaminhar uma proposta
              </button>
            </div>
          )}
        </section>
        <section className="how-wrap">
          <div className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  06 / SIMPLES, DO PRIMEIRO CONTATO À SUA CLÍNICA
                </span>
                <h2>
                  Seu próximo passo,
                  <br />
                  <span>com a Duna.</span>
                </h2>
              </div>
              <p>
                Você planeja os atendimentos.
                <br />
                Juntos, organizamos a locação.
              </p>
            </div>
            <div className="steps">
              {[
                ["Explore", "Escolha um plano ou simule seu cenário."],
                ["Conte para nós", "Informe sua clínica, região e período."],
                ["Receba sua proposta", "A equipe consulta a disponibilidade."],
                ["Confirme", "Aprove a proposta e formalize o contrato."],
                ["Organize sua agenda", "Combine a disponibilização do HIPRO."],
              ].map(([title, desc], i) => (
                <div key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section faq-section">
          <div>
            <span className="eyebrow">07 / PODE PERGUNTAR</span>
            <h2>
              Clareza em
              <br />
              <span>cada detalhe.</span>
            </h2>
            <p>
              As respostas para dar
              <br />o próximo passo com confiança.
            </p>
            <a className="text-link" href="#contato">
              Converse com a Duna
            </a>
          </div>
          <div className="faq-list">
            {c.faq.map((faq, i) => (
              <details key={i}>
                <summary>
                  {faq.question}
                  <Plus size={18} />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="contact-wrap" id="contato">
          <div className="section contact">
            <div className="contact-copy">
              <span className="eyebrow">
                VAMOS CONSTRUIR SEU PRÓXIMO PASSO?
              </span>
              <h2>
                A tecnologia é HIPRO.
                <br />
                <span>O cuidado é Duna.</span>
              </h2>
              <p>{c.about}</p>
              <span className="location">
                <MapPin size={18} />
                {c.serviceArea}
              </span>
              {whatsapp && (
                <a
                  className="button outline"
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("whatsapp_click")}
                >
                  <MessageCircle size={18} />
                  Conversar no WhatsApp
                </a>
              )}
              {agentUrl && (
                <a
                  className="text-link agent-link"
                  href={agentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Atendimento com o assistente Duna
                </a>
              )}
              <div className="contact-assurance">
                <ShieldCheck size={22} />
                <span>
                  Seu contato inicia uma conversa.
                  <br />
                  Sem compromisso de contratação.
                </span>
              </div>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <h3>Solicite sua proposta</h3>
              <p>Conte um pouco sobre sua clínica.</p>
              {includeScenario && (
                <div className="scenario-tag">
                  <ChartNoAxesCombined size={16} />
                  Seu cenário será incluído na solicitação
                  <button
                    type="button"
                    aria-label="Remover cenário da proposta"
                    onClick={() => setIncludeScenario(false)}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="form-grid">
                <label>
                  Seu nome
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={500}
                    placeholder="Como podemos chamar você?"
                  />
                </label>
                <label>
                  WhatsApp
                  <input
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    required
                    minLength={10}
                    maxLength={22}
                    placeholder="(61) 99999-9999"
                  />
                </label>
                <label>
                  Clínica
                  <input
                    name="clinic"
                    autoComplete="organization"
                    required
                    minLength={2}
                    maxLength={500}
                    placeholder="Nome da clínica"
                  />
                </label>
                <label>
                  Especialidade
                  <input
                    name="specialty"
                    required
                    minLength={2}
                    maxLength={500}
                    placeholder="Sua área de atuação"
                  />
                </label>
                <label>
                  Localização
                  <input
                    name="location"
                    autoComplete="address-level2"
                    required
                    minLength={2}
                    maxLength={500}
                    placeholder="Cidade / região"
                  />
                </label>
                <label>
                  Data desejada
                  <input name="date" type="date" required />
                </label>
                <label>
                  Frequência de utilização
                  <input
                    name="frequency"
                    required
                    maxLength={500}
                    placeholder="Ex.: uma vez por semana"
                  />
                </label>
                <label>
                  Plano de interesse
                  <Choice
                    value={selectedPlan}
                    onChange={setSelectedPlan}
                    options={[
                      ...new Set([
                        "Ainda não defini",
                        ...c.plans.map((p) => p.name),
                        selectedPlan,
                      ]),
                    ]}
                    label="Plano de interesse"
                  />
                </label>
                <label className="full-width">
                  Conte mais <span className="optional">(opcional)</span>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={2000}
                    placeholder="Necessidades, período ou condições de uma proposta concorrente. Não envie dados de pacientes."
                  />
                </label>
              </div>
              <label className="honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="consent">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  required
                />
                <label htmlFor="consent">
                  Li a <a href="/hipro/privacidade">Política de Privacidade</a> e
                  autorizo o contato sobre esta solicitação.
                </label>
              </div>
              <button
                className="button"
                disabled={sending || success || !consent}
                type="submit"
              >
                {sending
                  ? "Enviando..."
                  : success
                    ? "Solicitação registrada"
                    : "Solicitar minha proposta"}
              </button>
              {feedback && (
                <p
                  role="status"
                  className={"feedback " + (success ? "success" : "error")}
                >
                  {feedback}
                </p>
              )}
              <small>
                A reserva será confirmada pela equipe após análise da
                disponibilidade.
              </small>
            </form>
          </div>
        </section>
      </main>
      <footer className="footer">
        <a href="/" aria-label="Início">
          <img
            className="logo"
            src="/hipro/images/duna-logo.webp"
            alt="Duna Equipamentos"
            width="108"
            height="78"
          />
        </a>
        <div>
          <span>Duna Equipamentos · Brasília</span>
          <small>
            © {new Date().getFullYear()} · Novas possibilidades para sua
            clínica.
          </small>
        </div>
        <nav aria-label="Informações legais">
          <a href="/hipro/privacidade">Privacidade</a>
          <a href="/hipro/termos">Termos de uso</a>
          <button onClick={() => setCookies("pending")}>Cookies</button>
          <a href="#contato">Contato</a>
        </nav>
      </footer>
      {cookies === "pending" && (
        <aside
          className="cookie-banner"
          aria-label="Preferências de privacidade"
        >
          <div>
            <b>Sua privacidade importa.</b>
            <p>
              Usamos armazenamento essencial. Você escolhe se permite medir
              visitas aos planos e ações de interesse.{" "}
              <a href="/hipro/privacidade#cookies">Saiba mais</a>.
            </p>
          </div>
          <div>
            <button
              className="button outline small"
              onClick={() => cookieChoice("rejected")}
            >
              Só essenciais
            </button>
            <button
              className="button small"
              onClick={() => cookieChoice("accepted")}
            >
              Aceitar medição
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

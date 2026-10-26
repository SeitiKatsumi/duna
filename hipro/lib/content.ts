import { z } from "zod";
const text = z.string().trim().max(4000);
const image = z
  .string()
  .max(1000)
  .refine(
    (v) => /^\/images\/[a-z0-9._/-]+$/i.test(v) || /^https:\/\//.test(v),
    "Use uma imagem local ou URL HTTPS.",
  );
export const planSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: text.min(1),
  description: text,
  period: text,
  version: text,
  limits: text,
  materials: text,
  delivery: text,
  support: text,
  cancellation: text,
  price: z.number().min(0).max(10000000).nullable(),
  unit: text,
  payment: text,
});
export const contentSchema = z.object({
  headline: text.min(1),
  subtitle: text,
  technologyTitle: text,
  technologyDescription: text,
  about: text,
  heroImage: image,
  technologyImage: image,
  videoUrl: z
    .string()
    .max(1000)
    .refine((v) => !v || /^https:\/\//.test(v)),
  whatsapp: z
    .string()
    .regex(/^(|55[1-9][0-9]{9,10})$/, "Informe 55 + DDD + telefone."),
  legalName: text,
  legalEmail: z.union([z.literal(""), z.string().email()]),
  serviceArea: text,
  competitionEnabled: z.boolean(),
  competitionTerms: text,
  equipmentVersion: text,
  plans: z.array(planSchema).length(3),
  faq: z
    .array(z.object({ question: text.min(1), answer: text.min(1) }))
    .min(1)
    .max(20),
  calculator: z.object({
    days: z.number().int().min(1).max(365),
    procedures: z.array(z.string().min(1).max(80)).min(1).max(12),
  }),
});
export type Content = z.infer<typeof contentSchema>;
export const defaultContent: Content = {
  headline: "Alta tecnologia.\nNovas possibilidades\npara sua clínica.",
  subtitle:
    "O próximo passo começa com uma locação.\nTenha acesso ao HIPRO com a Duna, sem investir na compra do equipamento.",
  technologyTitle: "Precisão para cuidar.\nLiberdade para evoluir.",
  technologyDescription:
    "A tecnologia HIPRO combina ultrassom micro e macrofocado com controle digital de profundidade. Uma nova possibilidade para ampliar o portfólio da sua clínica.",
  about:
    "A Duna conecta sua clínica a novas possibilidades. Em Brasília, oferecemos locação de tecnologia estética com atendimento próximo para encontrar o formato que faz sentido para sua agenda.",
  heroImage: "/images/hipro-light.webp",
  technologyImage: "/images/hipro-dark.webp",
  videoUrl: "",
  whatsapp: "",
  legalName: "Duna Equipamentos",
  legalEmail: "",
  serviceArea: "Brasília · Distrito Federal",
  competitionEnabled: false,
  competitionTerms: "",
  equipmentVersion: "Versão e aplicadores confirmados na proposta",
  plans: [
    {
      id: "pontual",
      name: "Locação pontual",
      description: "Uma agenda especial. Uma nova possibilidade.",
      period: "Período a combinar",
      version: "Versão e aplicadores sob consulta",
      limits: "Conforme proposta",
      materials: "A confirmar na proposta",
      delivery: "Logística sob consulta",
      support: "Condições de suporte sob consulta",
      cancellation: "Reserva, cancelamento e reagendamento conforme contrato",
      price: null,
      unit: "por período",
      payment: "Conforme proposta",
    },
    {
      id: "recorrente",
      name: "Locação recorrente",
      description: "Mais previsibilidade para crescer com a sua agenda.",
      period: "Frequência programada",
      version: "Versão e aplicadores sob consulta",
      limits: "Conforme proposta",
      materials: "A confirmar na proposta",
      delivery: "Logística sob consulta",
      support: "Condições de suporte sob consulta",
      cancellation: "Reserva, cancelamento e reagendamento conforme contrato",
      price: null,
      unit: "por período",
      payment: "Conforme proposta",
    },
    {
      id: "personalizado",
      name: "Plano personalizado",
      description: "Um formato pensado para a realidade da sua clínica.",
      period: "Planejamento individual",
      version: "Versão e aplicadores sob consulta",
      limits: "Conforme proposta",
      materials: "A confirmar na proposta",
      delivery: "Logística sob consulta",
      support: "Condições de suporte sob consulta",
      cancellation: "Reserva, cancelamento e reagendamento conforme contrato",
      price: null,
      unit: "por período",
      payment: "Conforme proposta",
    },
  ],
  faq: [
    {
      question: "Preciso comprar o equipamento para oferecer os procedimentos?",
      answer:
        "Não. A locação permite utilizar o HIPRO pelo período contratado. Consulte disponibilidade, versão e condições com a Duna.",
    },
    {
      question: "Quais versões e aplicadores estão disponíveis?",
      answer:
        "A versão, os aplicadores e as aplicações compatíveis são confirmados na proposta. As fotos desta página mostram um HIPRO HOF; aplicações corporais dependem da configuração efetivamente disponibilizada.",
    },
    {
      question: "Como funcionam entrega, retirada e suporte?",
      answer:
        "Informe a localização da clínica e as datas desejadas. A equipe confirma a região atendida, logística, orientações e suporte previstos na contratação.",
    },
    {
      question: "A simulação garante o retorno apresentado?",
      answer:
        "Não. A calculadora é uma estimativa baseada nos dados que você informa. Demanda, valores, custos e resultados reais podem variar. Faturamento bruto não equivale a lucro.",
    },
    {
      question: "O envio do formulário já confirma minha reserva?",
      answer:
        "Não. Sua solicitação inicia o atendimento comercial. A reserva depende da confirmação de disponibilidade, aprovação da proposta e formalização do contrato.",
    },
    {
      question: "Posso encaminhar uma proposta concorrente?",
      answer:
        "Sim. Descreva a proposta no campo de observações, sem dados pessoais de terceiros. A Duna analisa as condições e retorna com uma proposta. A cobertura de valores depende dos critérios comerciais vigentes.",
    },
  ],
  calculator: {
    days: 1,
    procedures: ["Face", "Pescoço", "Papada", "Corpo (conforme versão)"],
  },
};

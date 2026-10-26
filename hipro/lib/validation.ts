import { z } from "zod";
const bounded = z.string().trim().max(500);
export const scenarioSchema = z.object({
  rows: z
    .array(
      z.object({
        area: bounded.min(1),
        quantity: z.number().int().min(0).max(10000),
        price: z.number().finite().min(0).max(1000000),
      }),
    )
    .min(1)
    .max(12),
  days: z.number().int().min(1).max(365),
  rental: z.number().finite().min(0).max(10000000).nullable(),
  other: z.number().finite().min(0).max(10000000).nullable(),
});
export const leadSchema = z.object({
  id: z.string().uuid(),
  name: bounded.min(2),
  clinic: bounded.min(2),
  specialty: bounded.min(2),
  location: bounded.min(2),
  phone: z
    .string()
    .regex(/^[0-9 ()+-]{10,22}$/)
    .refine((s) => {
      const n = s.replace(/\D/g, "");
      return n.length >= 10 && n.length <= 13;
    }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: bounded.min(1),
  plan: bounded.min(1),
  message: z.string().trim().max(2000),
  consent: z.literal(true),
  website: z.string().max(0),
  scenario: scenarioSchema.nullable(),
  utm: z
    .record(z.string().max(250))
    .refine((x) =>
      Object.keys(x).every((k) =>
        [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term",
        ].includes(k),
      ),
    ),
});

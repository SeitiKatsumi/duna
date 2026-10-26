export type Scenario = {
  rows: { area: string; quantity: number; price: number }[];
  days: number;
  rental: number | null;
  other: number | null;
};
export function calculate(s: Scenario) {
  if (
    !Number.isInteger(s.days) ||
    s.days < 1 ||
    s.days > 365 ||
    !s.rows.length ||
    s.rows.length > 12
  )
    throw new Error("Período ou procedimentos inválidos.");
  for (const row of s.rows)
    if (
      !row.area.trim() ||
      !Number.isInteger(row.quantity) ||
      row.quantity < 0 ||
      row.quantity > 10000 ||
      !Number.isFinite(row.price) ||
      row.price < 0 ||
      row.price > 1000000
    )
      throw new Error("Atendimentos ou valores inválidos.");
  for (const value of [s.rental, s.other])
    if (
      value !== null &&
      (!Number.isFinite(value) || value < 0 || value > 10000000)
    )
      throw new Error("Custo inválido.");
  const grossCents = s.rows.reduce(
    (sum, r) => sum + r.quantity * Math.round(r.price * 100),
    0,
  );
  const quantity = s.rows.reduce((sum, r) => sum + r.quantity, 0);
  const costCents =
    s.rental === null || s.other === null
      ? null
      : Math.round(s.rental * 100) * s.days + Math.round(s.other * 100);
  const resultCents = costCents === null ? null : grossCents - costCents;
  return {
    gross: grossCents / 100,
    costs: costCents === null ? null : costCents / 100,
    result: resultCents === null ? null : resultCents / 100,
    margin:
      resultCents === null || grossCents === 0
        ? null
        : (resultCents / grossCents) * 100,
    breakEven:
      costCents === null || grossCents === 0 || quantity === 0
        ? null
        : Math.ceil(costCents / (grossCents / quantity)),
    quantity,
  };
}

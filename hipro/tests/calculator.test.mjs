import assert from "node:assert/strict";
import { calculate } from "../lib/calculator.ts";
const scenario = {
  rows: [
    { area: "Face", quantity: 4, price: 600 },
    { area: "Papada", quantity: 2, price: 300 },
  ],
  days: 2,
  rental: 500,
  other: 200,
};
assert.deepEqual(calculate(scenario), {
  gross: 3000,
  costs: 1200,
  result: 1800,
  margin: 60,
  breakEven: 3,
  quantity: 6,
});
assert.equal(calculate({ ...scenario, rental: null }).result, null);
assert.equal(calculate({ ...scenario, other: null }).breakEven, null);
assert.equal(
  calculate({ ...scenario, rows: [{ area: "Face", quantity: 0, price: 0 }] })
    .margin,
  null,
);
assert.equal(
  calculate({
    ...scenario,
    rows: [
      { area: "Face", quantity: 1, price: 0.1 },
      { area: "Corpo", quantity: 1, price: 0.2 },
    ],
    rental: 0,
    other: 0,
  }).gross,
  0.3,
);
assert.equal(calculate({ ...scenario, rental: 2000 }).result, -1200);
assert.throws(() => calculate({ ...scenario, days: 0 }));
assert.throws(() =>
  calculate({ ...scenario, rows: [{ area: "Face", quantity: 1.5, price: 1 }] }),
);
assert.throws(() => calculate({ ...scenario, rental: NaN }));
console.log(
  "Calculator: revenue, daily rental, unknown costs, zero revenue, cents, negative result and invalid input passed.",
);

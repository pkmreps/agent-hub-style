import { useMemo, useState } from "react";
import { money, shippingCost, useShippingRates, usdFromPln } from "@/lib/store";

/** Weight-based shipping comparison across agents, driven by admin-managed rates. */
export function HaulCalculator() {
  const { data: rates } = useShippingRates();
  const [kg, setKg] = useState(2);

  const results = useMemo(() => {
    const list = (rates ?? [])
      .map((r) => ({ rate: r, cost: shippingCost(r, kg) }))
      .filter((r): r is { rate: (typeof list)[number]["rate"]; cost: number } => r.cost !== null);
    return list.sort((a, b) => a.cost - b.cost);
  }, [rates, kg]);

  const cheapest = results[0]?.cost ?? null;

  return (
    <section className="mb-8 rounded-3xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Kalkulator wagi
          </p>
          <h2 className="mt-1 text-xl font-black">Ile zapłacisz za wysyłkę haulu?</h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.5}
            max={30}
            step={0.5}
            value={kg}
            aria-label="Waga paczki w kg"
            onChange={(e) => setKg(Number(e.target.value))}
            className="w-48 accent-[color:var(--color-primary,#06b6d4)]"
          />
          <input
            type="number"
            min={0}
            step={0.1}
            value={kg}
            onChange={(e) => setKg(Number(e.target.value) || 0)}
            className="w-24 rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-sm font-bold text-muted-foreground">kg</span>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-5 rounded-xl border border-border bg-secondary/50 p-5 text-center text-xs text-muted-foreground">
          Brak zdefiniowanych stawek wysyłki dla tej wagi.
        </p>
      ) : (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {results.map(({ rate, cost }) => {
            const best = cost === cheapest;
            return (
              <li
                key={rate.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${best ? "border-primary bg-primary/10 glow-ring" : "border-border bg-secondary/50"}`}
              >
                <div>
                  <p className="text-sm font-bold">
                    {rate.agent_name}{" "}
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {rate.line_name}
                    </span>
                  </p>
                  {best ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                      Najtańsza opcja
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-bold">{money(cost)} PLN</p>
                  <p className="text-[11px] text-muted-foreground">≈ ${money(usdFromPln(cost))}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

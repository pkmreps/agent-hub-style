import { useMemo, useState } from "react";
import {
  money,
  shippingCost,
  useAgents,
  useShippingRates,
  usdFromPln,
  type ShippingRate,
} from "@/lib/store";

const MIN_KG = 0.5;
const MAX_KG = 25;

/** Weight-based shipping comparison across agents, driven by admin-managed rates. */
export function HaulCalculator() {
  const { data: rates } = useShippingRates();
  const { data: agents } = useAgents();
  const [kg, setKg] = useState(2);

  const avatarOf = (name: string) =>
    (agents ?? []).find((a) => a.name.toLowerCase() === name.toLowerCase())?.avatar_url ?? null;

  const results = useMemo(() => {
    const list: { rate: ShippingRate; cost: number }[] = [];
    for (const r of rates ?? []) {
      const cost = shippingCost(r, kg);
      if (cost !== null) list.push({ rate: r, cost });
    }
    return list.sort((a, b) => a.cost - b.cost);
  }, [rates, kg]);

  const cheapest = results[0]?.cost ?? null;
  const pct = ((kg - MIN_KG) / (MAX_KG - MIN_KG)) * 100;

  return (
    <section className="rounded-3xl border border-primary/30 bg-surface p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Kalkulator wagi
          </p>
          <h2 className="mt-1 text-xl font-black">Ile zapłacisz za wysyłkę haulu?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum {MIN_KG} kg, maksimum {MAX_KG} kg — co pół kilograma.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/60 px-5 py-3 text-center">
          <p className="font-display text-3xl font-black text-gradient-brand">{kg.toFixed(1)}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            kilogramy
          </p>
        </div>
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={MIN_KG}
          max={MAX_KG}
          step={0.5}
          value={kg}
          aria-label="Waga paczki w kg"
          onChange={(e) => setKg(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
          style={{
            background: `linear-gradient(90deg, var(--brand-cyan, #00f2fe) 0%, var(--brand-teal, #0d9488) ${pct}%, color-mix(in oklab, currentColor 15%, transparent) ${pct}%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-muted-foreground">
          <span>{MIN_KG} kg</span>
          <span>{MAX_KG} kg</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[0.5, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25].map((v) => (
            <button
              key={v}
              onClick={() => setKg(v)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                kg === v
                  ? "border-primary text-primary glow-ring"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {v} kg
            </button>
          ))}
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
            const avatar = avatarOf(rate.agent_name);
            return (
              <li
                key={rate.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${best ? "border-primary bg-primary/10 glow-ring" : "border-border bg-secondary/50"}`}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-[11px] font-bold">
                    {rate.agent_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{rate.agent_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{rate.line_name}</p>
                  {best ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                      Najtańsza opcja
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
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

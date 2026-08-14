import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useAgents, useCategories, useProducts } from "@/lib/store";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Product Finder — PKMREPS Agent & QC Finds" },
      {
        name: "description",
        content:
          "Znajdź najlepsze findsy, sprawdź zdjęcia QC i kup przez Litbuy, Kakaobuy lub USFans.",
      },
      { property: "og:title", content: "Product Finder — PKMREPS" },
      {
        property: "og:description",
        content: "Wyszukiwarka findsów z QC i bezpośrednimi linkami do agentów.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products } = useProducts();
  const { data: agents } = useAgents();
  const { data: categories } = useCategories();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const all = products ?? [];

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of all) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [all]);

  const filtered = useMemo(() => {
    const lo = min === "" ? -Infinity : Number(min);
    const hi = max === "" ? Infinity : Number(max);
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) &&
        (cat === "" || p.category === cat) &&
        Number(p.price) >= lo &&
        Number(p.price) <= hi,
    );
  }, [all, q, cat, min, max]);

  const inputCls =
    "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:glow-ring";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-border bg-surface/60 p-8 text-center glow-ring">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
          Agent &amp; QC Finds
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">
          Znajdź swoje <span className="text-gradient-brand">najlepsze findsy</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Sprawdzone produkty, zdjęcia QC i bezpośrednie linki do zakupu przez Twojego agenta.
        </p>
        <div className="mx-auto mt-6 flex max-w-xl gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("finder.search")}
            className={inputCls}
          />
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-semibold text-muted-foreground">
          {t("finder.priceFrom")}
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="0"
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="flex-1 text-xs font-semibold text-muted-foreground">
          {t("finder.priceTo")}
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="9999"
            className={`${inputCls} mt-1`}
          />
        </label>
        <button
          onClick={() => {
            setQ("");
            setCat("");
            setMin("");
            setMax("");
          }}
          className="rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {t("finder.clear")}
        </button>
      </div>

      <h2 className="mb-4 text-lg font-bold">
        {t("finder.all")} <span className="text-primary">({all.length})</span>
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCat("")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${cat === "" ? "border-primary text-primary glow-ring" : "border-border text-muted-foreground"}`}
        >
          {t("finder.allCats")} ({all.length})
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.name)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${cat === c.name ? "border-primary text-primary glow-ring" : "border-border text-muted-foreground"}`}
          >
            {c.name} ({counts[c.name] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          {t("finder.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} agents={agents ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

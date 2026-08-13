import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useAgents, useCategories, useProducts } from "@/lib/store";

export const Route = createFileRoute("/linki")({
  head: () => ({
    meta: [
      { title: "Linki z TikToka — PKMREPS" },
      {
        name: "description",
        content: "Wszystkie linki do produktów z naszych filmów na TikToku, w podziale na kategorie.",
      },
      { property: "og:title", content: "Linki z TikToka — PKMREPS" },
      {
        property: "og:description",
        content: "Produkty z TikToka z linkami do agentów i zdjęciami QC.",
      },
    ],
  }),
  component: LinkiPage,
});

function LinkiPage() {
  const { data: products } = useProducts();
  const { data: agents } = useAgents();
  const { data: categories } = useCategories();
  const [cat, setCat] = useState("");

  const filtered = useMemo(
    () => (products ?? []).filter((p) => cat === "" || p.category === cat),
    [products, cat],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">
        Linki z <span className="text-gradient-brand">TikToka</span>
      </h1>
      <div className="my-6 flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          onClick={() => setCat("")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${cat === "" ? "border-primary text-primary glow-ring" : "border-border text-muted-foreground"}`}
        >
          Wszystkie
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.name)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${cat === c.name ? "border-primary text-primary glow-ring" : "border-border text-muted-foreground"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          Brak produktów w tej kategorii.
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

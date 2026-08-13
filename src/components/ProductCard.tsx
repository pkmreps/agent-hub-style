import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Agent, Product } from "@/lib/store";

export function ProductCard({
  product,
  agents,
  onDetails,
}: {
  product: Product;
  agents: Agent[];
  onDetails?: (p: Product) => void;
}) {
  const [likes, setLikes] = useState(product.likes);
  const [dislikes, setDislikes] = useState(product.dislikes);
  const [wish, setWish] = useState(false);

  const vote = async (kind: "likes" | "dislikes") => {
    const next = kind === "likes" ? likes + 1 : dislikes + 1;
    if (kind === "likes") setLikes(next);
    else setDislikes(next);
    await supabase
      .from("products")
      .update(kind === "likes" ? { likes: next } : { dislikes: next })
      .eq("id", product.id);
  };


  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-primary/60 hover:glow-ring">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Brak zdjęcia
          </div>
        )}

        <button
          aria-label="Dodaj do ulubionych"
          onClick={() => setWish((w) => !w)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-deep/70 backdrop-blur transition-colors hover:border-primary"
        >
          <span className={wish ? "text-primary" : "text-muted-foreground"}>♥</span>
        </button>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <button
            aria-label="Lubię to"
            onClick={() => void vote("likes")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-deep/70 text-sm backdrop-blur hover:border-primary"
          >
            👍
          </button>
          <button
            aria-label="Nie lubię"
            onClick={() => void vote("dislikes")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-deep/70 text-sm backdrop-blur hover:border-primary"
          >
            👎
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-surface-deep/80 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
          <span>👍 {likes}</span>
          <span>👎 {dislikes}</span>
          <span>👁 {product.views}</span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold">{product.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {product.category || "Inne"}
          </span>
          <span className="rounded-md border border-brand-teal/50 bg-brand-teal/15 px-2 py-0.5 text-[11px] font-semibold text-brand-cyan">
            Quality: {product.quality}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="font-display text-lg font-bold">
            {Number(product.price).toFixed(2)} PLN
          </span>
          <div className="flex items-center gap-2">
            {product.qc_url ? (
              <a
                href={product.qc_url}
                target="_blank"
                rel="noreferrer"
                title="Zdjęcia QC"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-xs hover:border-primary hover:text-primary"
              >
                📷
              </a>
            ) : null}
            <button
              onClick={() => onDetails?.(product)}
              className="rounded-lg gradient-brand px-3 py-1.5 text-xs font-bold text-surface-deep"
            >
              Sprawdź →
            </button>
          </div>
        </div>

        <div className="grid gap-1.5">
          {agents.map((a) => {
            const href = product.agent_links?.[a.name] || a.referral_url;
            return (
              <a
                key={a.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:border-primary hover:text-primary"
              >
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt="" className="h-5 w-5 rounded-md object-cover" />
                ) : null}
                Kup przez {a.name}
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
}

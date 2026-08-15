import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PriceTags, QualityBadges } from "@/components/PriceTags";
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

  const gallery = [product.image_url, ...(product.images ?? [])].filter(
    (u): u is string => Boolean(u),
  );
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? null;

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
        {current ? (
          <img
            src={current}
            alt={product.title}
            loading="lazy"
            onClick={() => onDetails?.(product)}
            className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
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
        {gallery.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {gallery.map((url, i) => (
              <button
                key={`${url}-${i}`}
                onClick={() => setActive(i)}
                aria-label={`Kolorystyka ${i + 1}`}
                className={`h-9 w-9 overflow-hidden rounded-md border ${i === active ? "border-primary glow-ring" : "border-border"}`}
              >
                <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        {product.sizes?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="rounded-md border border-brand-teal/40 bg-secondary px-2 py-0.5 text-[11px] font-semibold text-brand-cyan"
              >
                {size}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {product.category || "Inne"}
          </span>
        </div>
        <QualityBadges quality={product.quality} batch={product.batch} />

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <PriceTags pln={Number(product.price)} />
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

import { createFileRoute } from "@tanstack/react-router";
import { useGuideSteps } from "@/lib/store";

export const Route = createFileRoute("/poradnik")({
  head: () => ({
    meta: [
      { title: "Poradnik krok po kroku — PKMREPS" },
      {
        name: "description",
        content: "Instrukcja krok po kroku: jak założyć konto u agenta, zamówić i sprawdzić QC.",
      },
      { property: "og:title", content: "Poradnik krok po kroku — PKMREPS" },
      {
        property: "og:description",
        content: "Naucz się zamawiać przez agenta w kilku prostych krokach.",
      },
    ],
  }),
  component: PoradnikPage,
});

function PoradnikPage() {
  const { data: steps } = useGuideSteps();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">
        Poradnik <span className="text-gradient-brand">krok po kroku</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Od rejestracji u agenta do odbioru paczki — wszystko w kilku krokach.
      </p>

      <div className="mt-8 space-y-5">
        {(steps ?? []).map((s) => (
          <article
            key={s.id}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/50 sm:flex-row"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-brand font-display text-lg font-black text-surface-deep">
              {s.step_number}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                Krok {s.step_number}: {s.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt={s.title}
                  loading="lazy"
                  className="mt-4 w-full rounded-xl border border-border object-cover"
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

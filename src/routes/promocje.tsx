import { createFileRoute } from "@tanstack/react-router";
import { useAgents, useSettings } from "@/lib/store";

export const Route = createFileRoute("/promocje")({
  head: () => ({
    meta: [
      { title: "Promocje i kupony agentów — PKMREPS" },
      {
        name: "description",
        content: "Aktualne kupony rejestracyjne i zniżki u agentów: Litbuy, Kakaobuy, USFans.",
      },
      { property: "og:title", content: "Promocje i kupony agentów — PKMREPS" },
      {
        property: "og:description",
        content: "Odbierz $450 w kuponach i 40% zniżki z kodem PKMR.",
      },
    ],
  }),
  component: PromocjePage,
});

function PromocjePage() {
  const { data: agents } = useAgents();
  const { data: settings } = useSettings();
  const code = settings?.["promo_code"] || "PKMR";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">
        Aktualne <span className="text-gradient-brand">promocje</span>
      </h1>
      <div className="mt-6 rounded-2xl border border-primary/40 bg-surface p-6 glow-ring">
        <p className="text-sm uppercase tracking-widest text-primary animate-pulse-glow">
          Limitowana oferta
        </p>
        <p className="mt-2 text-2xl font-black">$450 w kuponach + 40% zniżki</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Użyj kodu <span className="font-mono font-bold text-primary">{code}</span> przy
          rejestracji.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(agents ?? []).map((a) => (
          <a
            key={a.id}
            href={a.referral_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary hover:glow-ring"
          >
            {a.avatar_url ? (
              <img src={a.avatar_url} alt={a.name} className="h-11 w-11 rounded-xl object-cover" />
            ) : null}
            <div>
              <p className="font-bold">{a.name}</p>
              <p className="text-xs text-muted-foreground">Zarejestruj się i odbierz kupony</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

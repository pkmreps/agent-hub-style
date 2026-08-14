import { createFileRoute } from "@tanstack/react-router";
import { useAgents, useSettings } from "@/lib/store";

export const Route = createFileRoute("/agenci")({
  head: () => ({
    meta: [
      { title: "Agenci i reflinki — PKMREPS" },
      {
        name: "description",
        content: "Lista sprawdzonych agentów zakupowych z linkami rejestracyjnymi i bonusami.",
      },
      { property: "og:title", content: "Agenci i reflinki — PKMREPS" },
      {
        property: "og:description",
        content: "Litbuy, Kakaobuy, USFans i inni sprawdzeni agenci w jednym miejscu.",
      },
    ],
  }),
  component: AgenciPage,
});

function AgenciPage() {
  const { data: agents } = useAgents();
  const { data: settings } = useSettings();
  const discord = settings?.["discord_url"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">
        Zaufani <span className="text-gradient-brand">agenci</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Wybierz agenta, przez którego chcesz robić zakupy.
      </p>

      {discord ? (
        <a
          href={discord}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-xl border border-primary/50 bg-surface px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-primary glow-ring"
        >
          Dołącz na Discord
        </a>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(agents ?? []).map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/60 hover:glow-ring"
          >
            <div className="flex items-center gap-3">
              {a.avatar_url ? (
                <img
                  src={a.avatar_url}
                  alt={a.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : null}
              <h2 className="text-lg font-bold">{a.name}</h2>
            </div>
            <a
              href={a.referral_url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 block rounded-xl gradient-brand px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-wide text-surface-deep"
            >
              Zarejestruj się w {a.name}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

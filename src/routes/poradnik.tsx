import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAgents, useGuideSteps, useSettings } from "@/lib/store";
import { HaulCalculator } from "@/components/HaulCalculator";
import { convertLink, parseSourceLink } from "@/lib/linkConverter";

export const Route = createFileRoute("/poradnik")({
  head: () => ({
    meta: [
      { title: "Poradnik & Narzędzia — PKMREPS" },
      {
        name: "description",
        content:
          "Śledzenie paczek, QC Inspector i konwerter linków 1688/Taobao oraz poradniki krok po kroku.",
      },
      { property: "og:title", content: "Poradnik & Narzędzia — PKMREPS" },
      {
        property: "og:description",
        content: "Interaktywne narzędzia i instrukcje zamawiania przez agenta.",
      },
    ],
  }),
  component: PoradnikPage,
});

const card = "rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/50";
const field =
  "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";
const cta = "mt-3 w-full rounded-lg gradient-brand px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-surface-deep";

function PackageTracker() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className={card}>
      <h3 className="text-base font-bold">📦 Śledzenie paczek</h3>
      <p className="mt-1 text-xs text-muted-foreground">Standardowa dostawa 7–12 dni roboczych.</p>
      <input
        className={`${field} mt-3`}
        placeholder="Numer przesyłki"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className={cta}
        onClick={() => setStatus(code.trim() ? `Paczka ${code.trim()} — w tranzycie, szacowana dostawa 7–12 dni.` : null)}
      >
        Sprawdź status
      </button>
      {status ? <p className="mt-3 text-xs text-brand-cyan">{status}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {["17track.net", "parcelsapp.com", "cainiao.com"].map((h) => (
          <a
            key={h}
            href={`https://${h}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-2 py-1 text-muted-foreground hover:border-primary hover:text-primary"
          >
            {h}
          </a>
        ))}
      </div>
    </div>
  );
}

function QcInspector() {
  const [id, setId] = useState("");
  const link = id.trim() ? `https://cnfans.com/qc?id=${encodeURIComponent(id.trim())}` : "";

  return (
    <div className={card}>
      <h3 className="text-base font-bold">🔍 QC Inspector / Finder</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Wklej ID lub link produktu, aby otworzyć zdjęcia QC.
      </p>
      <input
        className={`${field} mt-3`}
        placeholder="ID produktu lub link"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <a
        href={link || "#"}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!link}
        className={`${cta} block text-center ${link ? "" : "pointer-events-none opacity-50"}`}
      >
        Znajdź zdjęcia QC
      </a>
    </div>
  );
}

function LinkConverter() {
  const { data: agents } = useAgents();
  const { data: settings } = useSettings();
  const [agent, setAgent] = useState("");
  const [url, setUrl] = useState("");
  const [out, setOut] = useState("");
  const [warn, setWarn] = useState("");
  const [copied, setCopied] = useState(false);

  const list = agents ?? [];
  const chosen = agent || list[0]?.name || "";

  const convert = () => {
    const raw = url.trim();
    setWarn("");
    if (!raw) return setOut("");
    if (!parseSourceLink(raw)) {
      setWarn("Nieprawidłowy link — obsługiwane są tylko Weidian, 1688 i Taobao. Link pozostaje bez zmian.");
      setOut(raw);
      return;
    }
    const template = settings?.[`converter_${chosen.trim().toLowerCase()}`];
    setOut(convertLink(raw, chosen, template));
  };

  return (
    <div className={card}>
      <h3 className="text-base font-bold">🔗 Smart Link Converter</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Wybierz agenta i zamień link 1688 / Taobao / Weidian na link afiliacyjny.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {list.map((a) => (
          <button
            key={a.id}
            onClick={() => setAgent(a.name)}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition-all ${
              chosen === a.name
                ? "border-primary text-primary glow-ring"
                : "border-border text-muted-foreground hover:border-primary"
            }`}
          >
            {a.avatar_url ? (
              <img src={a.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
            ) : null}
            {a.name}
          </button>
        ))}
      </div>
      <input
        className={`${field} mt-3`}
        placeholder="https://detail.1688.com/offer/123456789.html"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button className={cta} onClick={convert}>
        Konwertuj link
      </button>
      {out ? (
        <div className="mt-3 flex items-center gap-2">
          <p className="flex-1 break-all rounded-lg border border-border bg-secondary px-2 py-1.5 text-[11px] text-brand-cyan">
            {out}
          </p>
          <button
            className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-semibold hover:border-primary hover:text-primary"
            onClick={() => {
              void navigator.clipboard.writeText(out);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "OK" : "Kopiuj"}
          </button>
        </div>
      ) : null}
    </div>
  );
}


function PoradnikPage() {
  const { data: steps } = useGuideSteps();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">
        Poradnik <span className="text-gradient-brand">&amp; Narzędzia</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Najpierw narzędzia, na dole pełne poradniki krok po kroku.
      </p>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <PackageTracker />
        <QcInspector />
        <LinkConverter />
      </section>

      <section className="mt-8">
        <HaulCalculator />
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-black">
          Poradniki <span className="text-gradient-brand">krok po kroku</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Poradnik Zamawiania · Poradnik Śledzenia Paczki · Poradnik Używania
        </p>

        <div className="mt-6 space-y-5">
          {(steps ?? []).map((s) => (
            <article
              key={s.id}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/50 sm:flex-row"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-brand font-display text-lg font-black text-surface-deep">
                {s.step_number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">
                  Krok {s.step_number}: {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
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
      </section>
    </div>
  );
}

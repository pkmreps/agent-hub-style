import { Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/store";

const tabs = [
  { to: "/", label: "Product Finder" },
  { to: "/sprzedawcy", label: "Sprzedawcy" },
  { to: "/promocje", label: "Promocje" },
  { to: "/poradnik", label: "Poradnik" },
  { to: "/linki", label: "Linki z TikToka" },
] as const;

export function Header() {
  const { data: settings } = useSettings();
  const logo = settings?.["agent_logo_url"];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface-deep/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt="Logo agenta"
                className="h-10 w-10 rounded-xl object-cover glow-ring"
              />
            ) : null}
            <span className="font-display text-lg font-bold tracking-tight text-gradient-brand">
              PKMREPS
            </span>
          </Link>
          <nav className="ml-auto hidden flex-wrap items-center gap-1 md:flex">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-secondary glow-ring",
                }}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1 md:hidden">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/" }}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
              activeProps={{
                className:
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-primary bg-secondary",
              }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

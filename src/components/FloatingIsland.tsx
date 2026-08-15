import { useAgents, useSettings, useSocialLinks } from "@/lib/store";

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      aria-label={label}
      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary transition-all hover:glow-ring-strong hover:border-primary"
    >
      {children}
    </a>
  );
}

export function FloatingIsland() {
  const { data: agents } = useAgents();
  const { data: settings } = useSettings();
  const { data: socials } = useSocialLinks();
  const s = settings ?? {};

  const fallback = [
    ["TikTok", s["tiktok_url"], "TT"],
    ["Discord", s["discord_url"], "DC"],
    ["Telegram", s["telegram_url"], "TG"],
    ["WhatsApp", s["whatsapp_url"], "WA"],
    ["Instagram", s["instagram_url"], "IG"],
  ] as const;

  const dynamic = (socials ?? []).filter((l) => l.url);
  const links = dynamic.length
    ? dynamic.map((l) => ({
        id: l.id,
        label: l.label,
        url: l.url,
        icon: l.icon || l.label.slice(0, 2).toUpperCase(),
      }))
    : fallback
        .filter(([, url]) => Boolean(url))
        .map(([label, url, icon]) => ({ id: label, label, url: url as string, icon }));

  return (
    <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-border bg-surface-deep/80 p-2 backdrop-blur-xl glow-ring sm:flex">
      {links.map((l) => (
        <IconLink key={l.id} href={l.url} label={l.label}>
          <span className="text-xs font-bold">{l.icon}</span>
        </IconLink>
      ))}
      <div className="my-1 h-px bg-border" />
      {(agents ?? []).map((a) => (
        <IconLink key={a.id} href={a.referral_url} label={a.name}>
          {a.avatar_url ? (
            <img src={a.avatar_url} alt={a.name} className="h-7 w-7 rounded-lg object-cover" />
          ) : (
            <span className="text-xs font-bold">{a.name.slice(0, 2)}</span>
          )}
        </IconLink>
      ))}
    </div>
  );
}

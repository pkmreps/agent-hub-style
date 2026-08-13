import { useAgents, useSettings } from "@/lib/store";

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
  const s = settings ?? {};

  return (
    <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-border bg-surface-deep/80 p-2 backdrop-blur-xl glow-ring sm:flex">
      {s["tiktok_url"] ? (
        <IconLink href={s["tiktok_url"]} label="TikTok">
          <span className="text-xs font-bold">TT</span>
        </IconLink>
      ) : null}
      {s["discord_url"] ? (
        <IconLink href={s["discord_url"]} label="Discord">
          <span className="text-xs font-bold">DC</span>
        </IconLink>
      ) : null}
      {s["telegram_url"] ? (
        <IconLink href={s["telegram_url"]} label="Telegram">
          <span className="text-xs font-bold">TG</span>
        </IconLink>
      ) : null}
      {s["whatsapp_url"] ? (
        <IconLink href={s["whatsapp_url"]} label="WhatsApp">
          <span className="text-xs font-bold">WA</span>
        </IconLink>
      ) : null}
      {s["instagram_url"] ? (
        <IconLink href={s["instagram_url"]} label="Instagram">
          <span className="text-xs font-bold">IG</span>
        </IconLink>
      ) : null}
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

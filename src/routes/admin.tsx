import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import {
  saveSetting,
  useAgents,
  useCategories,
  useGuideSteps,
  useProducts,
  useRefresh,
  useSettings,
  type Product,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel administratora — PKMREPS" },
      { name: "description", content: "Wewnętrzny panel zarządzania treścią serwisu." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Panel administratora — PKMREPS" },
      { property: "og:description", content: "Wewnętrzny panel zarządzania treścią serwisu." },
    ],
  }),
  component: AdminPage,
});

const input =
  "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";
const btn =
  "rounded-lg gradient-brand px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-surface-deep";
const btnGhost =
  "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"branding" | "agents" | "categories" | "products" | "guide">(
    "branding",
  );

  useEffect(() => {
    if (sessionStorage.getItem("pkmr_admin") === "1") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (user === "admin" && (pass === "admin" || pass === "admin123")) {
              sessionStorage.setItem("pkmr_admin", "1");
              setAuthed(true);
            } else setErr("Nieprawidłowe dane logowania.");
          }}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-8 glow-ring"
        >
          <h1 className="text-xl font-black">Panel administratora</h1>
          <input
            className={input}
            placeholder="Login"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            className={input}
            type="password"
            placeholder="Hasło"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {err ? <p className="text-xs text-destructive">{err}</p> : null}
          <button className={`${btn} w-full`}>Zaloguj</button>
        </form>
      </div>
    );
  }

  const tabs = [
    ["branding", "Branding"],
    ["agents", "Agenci"],
    ["categories", "Kategorie"],
    ["products", "Produkty"],
    ["guide", "Poradnik"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gradient-brand">Panel administratora</h1>
        <button
          className={btnGhost}
          onClick={() => {
            sessionStorage.removeItem("pkmr_admin");
            setAuthed(false);
          }}
        >
          Wyloguj
        </button>
      </div>

      <div className="my-6 flex flex-wrap gap-2">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tab === k ? "border-primary text-primary glow-ring" : "border-border text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "branding" && <BrandingTab />}
      {tab === "agents" && <AgentsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "guide" && <GuideTab />}
    </div>
  );
}

const settingFields: [string, string][] = [
  ["agent_logo_url", "Logo agenta (URL)"],
  ["primary_agent_url", "Główny link rejestracyjny"],
  ["promo_banner_url", "Baner promo (URL)"],
  ["promo_code", "Kod promocyjny"],
  ["tiktok_url", "TikTok"],
  ["discord_url", "Discord"],
  ["telegram_url", "Telegram"],
  ["whatsapp_url", "WhatsApp"],
  ["instagram_url", "Instagram"],
];

function BrandingTab() {
  const { data } = useSettings();
  const refresh = useRefresh();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-bold">Branding i social</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {settingFields.map(([key, label]) => (
          <label key={key} className="text-xs font-semibold text-muted-foreground">
            {label}
            <input
              className={`${input} mt-1`}
              value={form[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {form["agent_logo_url"] ? (
        <img
          src={form["agent_logo_url"]}
          alt="Podgląd logo"
          className="mt-5 h-16 w-16 rounded-xl object-cover glow-ring"
        />
      ) : null}
      <button
        className={`${btn} mt-6`}
        onClick={async () => {
          for (const [key] of settingFields) await saveSetting(key, form[key] ?? "");
          await refresh("settings");
        }}
      >
        Zapisz
      </button>
    </section>
  );
}

function AgentsTab() {
  const { data: agents } = useAgents();
  const refresh = useRefresh();
  const empty = { name: "", avatar_url: "", referral_url: "", sort_order: 0 };
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty);

  const save = async () => {
    if (!form.name) return;
    if (form.id) await supabase.from("agents").update(form).eq("id", form.id);
    else await supabase.from("agents").insert(form);
    setForm(empty);
    await refresh("agents");
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-bold">{form.id ? "Edytuj agenta" : "Dodaj agenta"}</h2>
        <div className="space-y-3">
          <input
            className={input}
            placeholder="Nazwa"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={input}
            placeholder="Avatar URL"
            value={form.avatar_url ?? ""}
            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
          />
          <input
            className={input}
            placeholder="Link referencyjny"
            value={form.referral_url}
            onChange={(e) => setForm({ ...form, referral_url: e.target.value })}
          />
          <div className="flex gap-2">
            <button className={btn} onClick={() => void save()}>
              Zapisz
            </button>
            {form.id ? (
              <button className={btnGhost} onClick={() => setForm(empty)}>
                Anuluj
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-bold">Agenci</h2>
        <ul className="space-y-2">
          {(agents ?? []).map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3"
            >
              {a.avatar_url ? (
                <img src={a.avatar_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : null}
              <span className="flex-1 text-sm font-semibold">{a.name}</span>
              <button
                className={btnGhost}
                onClick={() =>
                  setForm({
                    id: a.id,
                    name: a.name,
                    avatar_url: a.avatar_url ?? "",
                    referral_url: a.referral_url,
                    sort_order: a.sort_order,
                  })
                }
              >
                Edytuj
              </button>
              <button
                className={btnGhost}
                onClick={async () => {
                  await supabase.from("agents").delete().eq("id", a.id);
                  await refresh("agents");
                }}
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoriesTab() {
  const { data: categories } = useCategories();
  const refresh = useRefresh();
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return;
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (editId) await supabase.from("categories").update({ name, slug }).eq("id", editId);
    else await supabase.from("categories").insert({ name, slug, sort_order: 99 });
    setName("");
    setEditId(null);
    await refresh("categories");
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-bold">Zarządzanie kategoriami</h2>
      <div className="flex gap-2">
        <input
          className={input}
          placeholder="Nazwa kategorii"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={btn} onClick={() => void save()}>
          {editId ? "Zapisz" : "Dodaj"}
        </button>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2">
        {(categories ?? []).map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs"
          >
            <span className="font-semibold">{c.name}</span>
            <button
              className="text-primary"
              onClick={() => {
                setEditId(c.id);
                setName(c.name);
              }}
            >
              edytuj
            </button>
            <button
              className="text-destructive"
              onClick={async () => {
                await supabase.from("categories").delete().eq("id", c.id);
                await refresh("categories");
              }}
            >
              usuń
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductsTab() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: agents } = useAgents();
  const refresh = useRefresh();

  const empty = {
    title: "",
    category: "",
    price: 0,
    image_url: "",
    qc_url: "",
    quality: "Best",
    agent_links: {} as Record<string, string>,
  };
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty);

  const save = async () => {
    if (!form.title) return;
    const payload = {
      title: form.title,
      category: form.category,
      price: Number(form.price) || 0,
      image_url: form.image_url,
      qc_url: form.qc_url,
      quality: form.quality,
      agent_links: form.agent_links,
    };
    if (form.id) await supabase.from("products").update(payload).eq("id", form.id);
    else await supabase.from("products").insert(payload);
    setForm(empty);
    await refresh("products");
  };

  const preview: Product = {
    id: "preview",
    title: form.title || "Nazwa produktu",
    category: form.category,
    price: Number(form.price) || 0,
    image_url: form.image_url || null,
    qc_url: form.qc_url || null,
    quality: form.quality,
    likes: 0,
    dislikes: 0,
    views: 0,
    agent_links: form.agent_links,
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">
            {form.id ? "Edytuj produkt" : "Dodaj produkt"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              placeholder="Tytuł"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className={input}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">— kategoria —</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className={input}
              type="number"
              placeholder="Cena PLN"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              className={input}
              placeholder="Quality (np. Best)"
              value={form.quality}
              onChange={(e) => setForm({ ...form, quality: e.target.value })}
            />
            <input
              className={input}
              placeholder="Zdjęcie URL"
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <input
              className={input}
              placeholder="Link do zdjęć QC"
              value={form.qc_url ?? ""}
              onChange={(e) => setForm({ ...form, qc_url: e.target.value })}
            />
          </div>

          <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Linki produktu u agentów
          </h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(agents ?? []).map((a) => (
              <input
                key={a.id}
                className={input}
                placeholder={`Link ${a.name}`}
                value={form.agent_links[a.name] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    agent_links: { ...form.agent_links, [a.name]: e.target.value },
                  })
                }
              />
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button className={btn} onClick={() => void save()}>
              Zapisz produkt
            </button>
            {form.id ? (
              <button className={btnGhost} onClick={() => setForm(empty)}>
                Anuluj
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">Podgląd na żywo</h2>
          <ProductCard product={preview} agents={agents ?? []} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-bold">Wszystkie produkty</h2>
        <ul className="space-y-2">
          {(products ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3"
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : null}
              <span className="flex-1 text-sm font-semibold">{p.title}</span>
              <span className="text-xs text-muted-foreground">{p.category}</span>
              <button
                className={btnGhost}
                onClick={() =>
                  setForm({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    price: p.price,
                    image_url: p.image_url ?? "",
                    qc_url: p.qc_url ?? "",
                    quality: p.quality,
                    agent_links: p.agent_links ?? {},
                  })
                }
              >
                Edytuj
              </button>
              <button
                className={btnGhost}
                onClick={async () => {
                  await supabase.from("products").delete().eq("id", p.id);
                  await refresh("products");
                }}
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GuideTab() {
  const { data: steps } = useGuideSteps();
  const refresh = useRefresh();
  const empty = { step_number: 1, title: "", description: "", image_url: "" };
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty);

  const save = async () => {
    if (!form.title) return;
    if (form.id) await supabase.from("guide_steps").update(form).eq("id", form.id);
    else await supabase.from("guide_steps").insert(form);
    setForm(empty);
    await refresh("guide_steps");
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-bold">{form.id ? "Edytuj krok" : "Dodaj krok"}</h2>
        <div className="space-y-3">
          <input
            className={input}
            type="number"
            placeholder="Numer kroku"
            value={form.step_number}
            onChange={(e) => setForm({ ...form, step_number: Number(e.target.value) })}
          />
          <input
            className={input}
            placeholder="Tytuł"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className={`${input} min-h-28`}
            placeholder="Opis"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={input}
            placeholder="Grafika URL"
            value={form.image_url ?? ""}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <div className="flex gap-2">
            <button className={btn} onClick={() => void save()}>
              Zapisz
            </button>
            {form.id ? (
              <button className={btnGhost} onClick={() => setForm(empty)}>
                Anuluj
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-bold">Kroki poradnika</h2>
        <ul className="space-y-2">
          {(steps ?? []).map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3"
            >
              <span className="text-primary">#{s.step_number}</span>
              <span className="flex-1 text-sm font-semibold">{s.title}</span>
              <button
                className={btnGhost}
                onClick={() =>
                  setForm({
                    id: s.id,
                    step_number: s.step_number,
                    title: s.title,
                    description: s.description,
                    image_url: s.image_url ?? "",
                  })
                }
              >
                Edytuj
              </button>
              <button
                className={btnGhost}
                onClick={async () => {
                  await supabase.from("guide_steps").delete().eq("id", s.id);
                  await refresh("guide_steps");
                }}
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

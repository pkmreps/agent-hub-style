import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Agent = {
  id: string;
  name: string;
  avatar_url: string | null;
  referral_url: string;
  sort_order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  image_url: string | null;
  qc_url: string | null;
  quality: string;
  likes: number;
  dislikes: number;
  views: number;
  agent_links: Record<string, string>;
  sizes: string[];
  images: string[];
};

export type GuideStep = {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
};

export type Settings = Record<string, string>;

export const useAgents = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Agent[];
    },
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        agent_links: (p.agent_links ?? {}) as Record<string, string>,
      })) as Product[];
    },
  });

export const useGuideSteps = () =>
  useQuery({
    queryKey: ["guide_steps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guide_steps").select("*").order("step_number");
      if (error) throw error;
      return (data ?? []) as GuideStep[];
    },
  });

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      const out: Settings = {};
      for (const row of data ?? []) out[row.key] = row.value;
      return out;
    },
  });

export function useRefresh() {
  const qc = useQueryClient();
  return (key: string) => qc.invalidateQueries({ queryKey: [key] });
}

export async function saveSetting(key: string, value: string) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}

/** Parse a comma-separated string into a clean list of values. */
export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Safari/iOS private mode can throw on storage access — never let that crash the app. */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      globalThis.sessionStorage?.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      globalThis.sessionStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/** SHA-256 hex digest with a pure-JS fallback for non-secure WebKit contexts. */
export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const buf = await subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return jsSha256(text);
}

function jsSha256(ascii: string): string {
  const K: number[] = [];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const isPrime = (n: number) => {
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  for (let n = 2, i = 0; i < 64; n++) {
    if (!isPrime(n)) continue;
    K[i++] = Math.floor((Math.cbrt(n) % 1) * 2 ** 32) | 0;
  }
  const bytes = Array.from(new TextEncoder().encode(ascii));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLen / 2 ** (8 * i)) & 0xff);
  const w = new Array<number>(64);
  const rr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++)
      w[i] =
        (bytes[off + i * 4] << 24) |
        (bytes[off + i * 4 + 1] << 16) |
        (bytes[off + i * 4 + 2] << 8) |
        bytes[off + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    const vals = [a, b, c, d, e, f, g, h];
    for (let i = 0; i < 8; i++) H[i] = (H[i] + vals[i]) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
}

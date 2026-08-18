export type SourcePlatform = "weidian" | "1688" | "taobao";

export type ParsedLink = { platform: SourcePlatform; id: string; url: string };

/**
 * Waliduje link źródłowy. Zwraca null, gdy link nie jest poprawnym linkiem
 * produktowym Weidian / 1688 / Taobao — wtedy NIE wolno go konwertować.
 */
export function parseSourceLink(raw: string): ParsedLink | null {
  const url = (raw ?? "").trim();
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  // Weidian: weidian.com lub shopXXXX.v.weidian.com + itemID=
  if (host === "weidian.com" || host.endsWith(".weidian.com")) {
    const id =
      parsed.searchParams.get("itemID") ??
      parsed.searchParams.get("itemid") ??
      parsed.searchParams.get("itemId");
    if (id && /^\d+$/.test(id.trim())) return { platform: "weidian", id: id.trim(), url };
    return null;
  }

  // 1688: detail.1688.com/offer/<id>.html
  if (host.endsWith("1688.com")) {
    const m = path.match(/\/offer\/(\d+)/);
    if (host.startsWith("detail.") && m?.[1]) return { platform: "1688", id: m[1], url };
    return null;
  }

  // Taobao: item.taobao.com?id=
  if (host === "item.taobao.com" || host.endsWith(".item.taobao.com")) {
    const id = parsed.searchParams.get("id");
    if (id && /^\d+$/.test(id.trim())) return { platform: "taobao", id: id.trim(), url };
    return null;
  }

  return null;
}

const USFANS_PLATFORM: Record<SourcePlatform, string> = {
  "1688": "1",
  taobao: "2",
  weidian: "3",
};

const LITBUY_PLATFORM: Record<SourcePlatform, string> = {
  "1688": "0",
  taobao: "1",
  weidian: "weidian",
};

function normalizeAgent(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Konwertuje zweryfikowany link na link afiliacyjny agenta.
 * Gdy link jest niepoprawny lub agent nieobsługiwany — zwraca oryginalny link bez zmian.
 */
export function convertLink(rawUrl: string, agentName: string, template?: string): string {
  const original = (rawUrl ?? "").trim();
  const parsed = parseSourceLink(original);
  if (!parsed) return original;

  const agent = normalizeAgent(agentName ?? "");

  if (agent === "usfans") {
    return `https://www.usfans.com/product/${USFANS_PLATFORM[parsed.platform]}/${parsed.id}?ref=5FTXZW`;
  }
  if (agent === "kakobuy" || agent === "kakaobuy") {
    return `https://item.kakobuy.com/item/details?url=${encodeURIComponent(parsed.url)}`;
  }
  if (agent === "litbuy") {
    return `https://litbuy.com/product/${LITBUY_PLATFORM[parsed.platform]}/${parsed.id}?linkSearch=true&inviteCode=PKMR`;
  }

  const tpl = (template ?? "").trim();
  if (tpl) {
    return tpl
      .replaceAll("{platform}", parsed.platform === "1688" ? "ali_1688" : parsed.platform)
      .replaceAll("{id}", parsed.id)
      .replaceAll("{url}", encodeURIComponent(parsed.url));
  }

  // Brak reguły dla agenta — nie psujemy linku.
  return original;
}

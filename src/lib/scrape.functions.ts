import { createServerFn } from "@tanstack/react-start";

/** Fetch a product page and best-effort parse title, images and price. */
export const scrapeProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || !/^https?:\/\//i.test(data.url)) throw new Error("Nieprawidłowy link.");
    return { url: data.url };
  })
  .handler(async ({ data }) => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        "Accept-Language": "en,pl;q=0.8",
      },
    });
    if (!res.ok) return { ok: false as const, error: `HTTP ${res.status}` };
    const html = await res.text();

    const meta = (prop: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        "i",
      );
      const alt = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
        "i",
      );
      return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? "";
    };

    const title =
      meta("og:title") || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "";

    const images = Array.from(
      new Set(
        [
          meta("og:image"),
          ...Array.from(html.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp))/gi)).map(
            (m) => m[1] as string,
          ),
        ].filter(Boolean),
      ),
    ).slice(0, 8);

    const priceRaw =
      meta("og:price:amount") ||
      meta("product:price:amount") ||
      html.match(/["'](?:price|salePrice)["']\s*:\s*["']?([0-9]+(?:\.[0-9]+)?)/i)?.[1] ||
      "";
    const priceCny = Number(priceRaw) || 0;

    const sizes = Array.from(
      new Set(
        Array.from(html.matchAll(/\b(XXS|XS|S|M|L|XL|XXL|XXXL|3XL|4XL)\b/g)).map(
          (m) => m[1] as string,
        ),
      ),
    ).slice(0, 12);

    return { ok: true as const, title, images, priceCny, sizes };
  });

import { scoreTitle } from "./sentiment.ts";
import type { Headline } from "./types.ts";

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([\da-f]+);/gi, (entity, digits: string) => {
      const codePoint = Number.parseInt(digits, 16);
      return codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff)
        ? String.fromCodePoint(codePoint)
        : entity;
    })
    .replace(/&#(\d+);/g, (entity, digits: string) => {
      const codePoint = Number.parseInt(digits, 10);
      return codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff)
        ? String.fromCodePoint(codePoint)
        : entity;
    })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

export function parseNewsFeed(xml: string): Headline[] {
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const seen = new Set<string>();
  const headlines: Headline[] = [];

  for (const block of blocks) {
    const item = block[1] ?? "";
    const rawTitle = decodeXml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const link = decodeXml(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const pub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    if (!rawTitle) continue;

    let title = rawTitle;
    let publisher = "Google News";
    const separator = rawTitle.lastIndexOf(" - ");
    if (separator > 20) {
      title = rawTitle.slice(0, separator).trim();
      publisher = rawTitle.slice(separator + 3).trim() || publisher;
    }

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const scored = scoreTitle(title);
    const parsedDate = pub ? new Date(pub) : null;
    const publishedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
    headlines.push({
      title,
      publisher,
      url: link.startsWith("http") ? link : null,
      publishedAt,
      sentiment: scored.sentiment,
      events: scored.events,
    });
    if (headlines.length >= 8) break;
  }

  return headlines;
}
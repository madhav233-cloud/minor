export interface ScoredHeadline {
  title: string;
  publisher: string;
  url: string | null;
  publishedAt: string | null;
  sentiment: number;
  events: string[];
}

const POS = [
  "beat",
  "beats",
  "surge",
  "surges",
  "record",
  "upgrade",
  "approval",
  "approves",
  "partnership",
  "buyback",
  "dividend",
  "outperform",
  "rally",
  "rallies",
  "growth",
  "expands",
  "expansion",
  "launch",
  "launches",
  "strong",
  "gain",
  "gains",
  "rises",
  "rise",
  "jumps",
  "jump",
  "boost",
  "wins",
  "awarded",
  "profit",
  "profits",
];

const NEG = [
  "miss",
  "misses",
  "probe",
  "investigation",
  "lawsuit",
  "fraud",
  "downgrade",
  "loss",
  "losses",
  "decline",
  "declines",
  "cut",
  "cuts",
  "warning",
  "default",
  "bankruptcy",
  "penalty",
  "recall",
  "layoff",
  "layoffs",
  "slump",
  "plunge",
  "plunges",
  "weak",
  "falls",
  "fall",
  "drops",
  "drop",
  "fine",
  "fines",
  "scandal",
  "delay",
  "delays",
];

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

export function scoreTitle(title: string): { sentiment: number; events: string[] } {
  const events: string[] = [];
  const t = title.toLowerCase();
  if (/regulat|antitrust|\bprobe\b|investigation/.test(t)) events.push("regulatory");
  if (/lawsuit|litigation|\bsues\b|\bsued\b/.test(t)) events.push("litigation");
  if (/earnings|\bprofit\b|\brevenue\b|quarter/.test(t)) events.push("earnings");
  if (/acqui|merger|takeover/.test(t)) events.push("m&a");
  if (/launch|unveils|introduces/.test(t)) events.push("product");
  if (/\bceo\b|appoints|resigns/.test(t)) events.push("management");
  if (/expan|capacity|\binvests\b|\binvestment\b/.test(t)) events.push("expansion");
  if (/fraud|bankrupt|default/.test(t)) events.push("distress");

  let s = 0;
  let hits = 0;
  for (const w of POS) {
    if (hasWord(t, w)) {
      s += 1;
      hits += 1;
    }
  }
  for (const w of NEG) {
    if (hasWord(t, w)) {
      s -= 1;
      hits += 1;
    }
  }
  const severe =
    events.includes("regulatory") || events.includes("litigation") || events.includes("distress");
  if (severe) s -= 0.8;
  if (hits === 0 && !severe) return { sentiment: 0, events };
  const sentiment = Math.max(-1, Math.min(1, s / Math.max(1, hits)));
  return { sentiment, events };
}

export function recencyWeight(iso: string | null, now = Date.now()): number {
  if (!iso) return 0.5;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0.5;
  const age = (now - t) / 86_400_000;
  if (age < 0) return 0.7;
  if (age <= 7) return 1;
  if (age <= 21) return 0.75;
  if (age <= 45) return 0.45;
  return 0.25;
}

export function aggregateSentiment(items: ScoredHeadline[], now = Date.now()): number | null {
  if (items.length === 0) return null;
  let wSum = 0;
  let acc = 0;
  for (const item of items) {
    const w = recencyWeight(item.publishedAt, now);
    wSum += w;
    acc += w * item.sentiment;
  }
  if (wSum === 0) return 0;
  return acc / wSum;
}

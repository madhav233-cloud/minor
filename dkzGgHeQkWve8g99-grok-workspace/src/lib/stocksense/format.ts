export function pct(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(digits)}%`;
}

export function num(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function money(n: number | null | undefined, currency: string): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const code = currency && currency.length === 3 ? currency : "USD";
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${code}`;
  }
}

export function compactMoney(n: number | null | undefined, currency: string): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const code = currency && currency.length === 3 ? currency : "USD";
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(0)} ${code}`;
  }
}

export function prettyDate(iso: string | null | undefined): string {
  if (!iso) return "unknown date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown date";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function stanceLabel(s: string): string {
  switch (s) {
    case "bullish":
      return "Bullish";
    case "bearish":
      return "Bearish";
    case "neutral":
      return "Neutral";
    default:
      return "Insufficient data";
  }
}

export function riskLabel(s: string): string {
  switch (s) {
    case "low":
      return "Low";
    case "moderate":
      return "Moderate";
    case "elevated":
      return "Elevated";
    case "high":
      return "High";
    default:
      return "Insufficient data";
  }
}

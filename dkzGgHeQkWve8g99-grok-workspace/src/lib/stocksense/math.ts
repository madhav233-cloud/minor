export interface Bar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function sma(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) sum += values[i]!;
  return sum / period;
}

export function sampleStd(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

function emaSeries(values: number[], period: number): number[] {
  const out = Array<number>(values.length).fill(Number.NaN);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += values[i]!;
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i]! * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rsiWilder(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i]! - closes[i - 1]!;
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function macdLast(closes: number[]): {
  macd: number;
  signal: number;
  hist: number;
  prevHist: number;
} | null {
  if (closes.length < 40) return null;
  const e12 = emaSeries(closes, 12);
  const e26 = emaSeries(closes, 26);
  const valid: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (Number.isFinite(e12[i]) && Number.isFinite(e26[i])) valid.push(e12[i]! - e26[i]!);
  }
  if (valid.length < 12) return null;
  const sig = emaSeries(valid, 9);
  const s = sig[sig.length - 1];
  const prevS = sig[sig.length - 2];
  if (s == null || prevS == null || !Number.isFinite(s) || !Number.isFinite(prevS)) return null;
  const m = valid[valid.length - 1]!;
  const prevM = valid[valid.length - 2]!;
  return { macd: m, signal: s, hist: m - s, prevHist: prevM - prevS };
}

export function atrWilder(bars: Bar[], period = 14): number | null {
  if (bars.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const b = bars[i]!;
    const p = bars[i - 1]!;
    trs.push(Math.max(b.h - b.l, Math.abs(b.h - p.c), Math.abs(b.l - p.c)));
  }
  let avg = 0;
  for (let i = 0; i < period; i++) avg += trs[i]!;
  avg /= period;
  for (let i = period; i < trs.length; i++) avg = (avg * (period - 1) + trs[i]!) / period;
  return avg;
}

export function pctChange(closes: number[], days: number): number | null {
  if (days <= 0 || closes.length <= days) return null;
  const a = closes[closes.length - 1 - days];
  const b = closes[closes.length - 1];
  if (a == null || b == null || a === 0) return null;
  return b / a - 1;
}

export function dailyReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const a = closes[i - 1]!;
    const b = closes[i]!;
    if (a !== 0) out.push(b / a - 1);
  }
  return out;
}

export function annualizedVol(rets: number[]): number | null {
  const sd = sampleStd(rets);
  if (sd == null) return null;
  return sd * Math.sqrt(252);
}

export function maxDrawdown(closes: number[]): number | null {
  if (closes.length < 5) return null;
  let peak = closes[0]!;
  let mdd = 0;
  for (const c of closes) {
    if (c > peak) peak = c;
    const dd = peak === 0 ? 0 : c / peak - 1;
    if (dd < mdd) mdd = dd;
  }
  return mdd;
}

export function historicalVar(rets: number[], q = 0.05): number | null {
  if (rets.length < 30) return null;
  const sorted = [...rets].sort((a, b) => a - b);
  const idx = Math.max(0, Math.ceil(q * sorted.length) - 1);
  return sorted[idx] ?? null;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

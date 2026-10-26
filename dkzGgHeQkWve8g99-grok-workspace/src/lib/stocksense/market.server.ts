import { buildBundleShell } from "./assess";
import { pct, prettyDate } from "./format";
import {
  annualizedVol,
  atrWilder,
  dailyReturns,
  historicalVar,
  macdLast,
  maxDrawdown,
  pctChange,
  rsiWilder,
  sampleStd,
  sma,
  type Bar,
} from "./math";
import { parseNewsFeed } from "./news-feed.ts";
import { aggregateSentiment, recencyWeight } from "./sentiment";
import { HORIZON_META, type AnalysisBundle, type Headline, type Horizon, type MetricPack } from "./types";

const UA = "Mozilla/5.0 (compatible; StockSense/2.0; educational research)";

interface Session {
  cookie: string;
  crumb: string;
  exp: number;
}

function cacheBag(): { session: Session | null } {
  const g = globalThis as unknown as { __ssYahoo?: { session: Session | null } };
  if (!g.__ssYahoo) g.__ssYahoo = { session: null };
  return g.__ssYahoo;
}

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function yRaw(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  const o = asRecord(x);
  if (!o) return null;
  return typeof o.raw === "number" && Number.isFinite(o.raw) ? o.raw : null;
}

function yFmt(x: unknown): string | null {
  const o = asRecord(x);
  return o && typeof o.fmt === "string" ? o.fmt : null;
}

function yText(x: unknown): string | null {
  return typeof x === "string" && x.trim() ? x.trim() : null;
}

function isoFromUnix(sec: number | null): string | null {
  if (sec == null) return null;
  const d = new Date(sec * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function cookieHeader(res: Response, previous = ""): string {
  const parts: string[] = previous ? previous.split(";").map((p) => p.trim()).filter(Boolean) : [];
  const fresh = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of fresh) {
    const pair = c.split(";")[0]?.trim();
    if (pair) parts.push(pair);
  }
  return parts.join("; ");
}

async function getSession(): Promise<Session> {
  const bag = cacheBag();
  if (bag.session && bag.session.exp > Date.now()) return bag.session;
  const first = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": UA },
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
  });
  let cookie = cookieHeader(first);
  const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
    headers: { "User-Agent": UA, Cookie: cookie },
    signal: AbortSignal.timeout(12_000),
  });
  cookie = cookieHeader(crumbRes, cookie);
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.includes("<") || crumb.includes(" ")) {
    throw new Error("The market-data session could not be opened. Try again in a moment.");
  }
  bag.session = { cookie, crumb, exp: Date.now() + 20 * 60 * 1000 };
  return bag.session;
}

interface Resolved {
  symbol: string;
  name: string;
  exchange: string;
  sector: string | null;
  industry: string | null;
}

async function searchEquity(query: string): Promise<Resolved | null> {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12_000) });
  if (!res.ok) return null;
  const body = (await res.json()) as { quotes?: unknown[] };
  const quotes = Array.isArray(body.quotes) ? body.quotes : [];
  const equities = quotes
    .map((q) => asRecord(q))
    .filter((q): q is Record<string, unknown> => !!q && q.quoteType === "EQUITY" && typeof q.symbol === "string");
  if (equities.length === 0) return null;
  const exact = equities.find((q) => String(q.symbol).toLowerCase() === query.toLowerCase());
  const hit = exact ?? equities[0]!;
  return {
    symbol: String(hit.symbol),
    name: yText(hit.longname) ?? yText(hit.shortname) ?? String(hit.symbol),
    exchange: yText(hit.exchDisp) ?? yText(hit.exchange) ?? "",
    sector: yText(hit.sectorDisp) ?? yText(hit.sector),
    industry: yText(hit.industryDisp) ?? yText(hit.industry),
  };
}

async function fetchChart(symbol: string): Promise<{ bars: Bar[]; meta: Record<string, unknown> } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2y&includePrePost=false`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12_000) });
  if (!res.ok) return null;
  const body = asRecord(await res.json());
  const chart = asRecord(body?.chart);
  const result = Array.isArray(chart?.result) ? asRecord(chart.result[0]) : null;
  if (!result) return null;
  const meta = asRecord(result.meta) ?? {};
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const indicators = asRecord(result.indicators);
  const quote = Array.isArray(indicators?.quote) ? asRecord(indicators.quote[0]) : null;
  if (!quote) return null;
  const opens = Array.isArray(quote.open) ? quote.open : [];
  const highs = Array.isArray(quote.high) ? quote.high : [];
  const lows = Array.isArray(quote.low) ? quote.low : [];
  const closes = Array.isArray(quote.close) ? quote.close : [];
  const vols = Array.isArray(quote.volume) ? quote.volume : [];
  const bars: Bar[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i];
    const c = closes[i];
    if (typeof t !== "number" || typeof c !== "number" || !Number.isFinite(c)) continue;
    const o = typeof opens[i] === "number" ? opens[i] : c;
    const h = typeof highs[i] === "number" ? highs[i] : c;
    const l = typeof lows[i] === "number" ? lows[i] : c;
    const v = typeof vols[i] === "number" ? vols[i] : 0;
    bars.push({ t, o, h, l, c, v });
  }
  if (bars.length < 2) return null;
  return { bars, meta };
}

async function fetchSummary(symbol: string): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const session = await getSession();
    const url = new URL(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`);
    url.searchParams.set(
      "modules",
      "financialData,defaultKeyStatistics,incomeStatementHistory,balanceSheetHistory,summaryDetail,price",
    );
    url.searchParams.set("crumb", session.crumb);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Cookie: session.cookie },
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 401 || res.status === 403) {
      cacheBag().session = null;
      continue;
    }
    if (!res.ok) return null;
    const body = asRecord(await res.json());
    const qs = asRecord(body?.quoteSummary);
    const result = Array.isArray(qs?.result) ? asRecord(qs.result[0]) : null;
    if (!result && asRecord(qs?.error)) {
      cacheBag().session = null;
      continue;
    }
    return result;
  }
  return null;
}

async function fetchHeadlines(name: string, currency: string): Promise<Headline[]> {
  const india = currency === "INR";
  const q = `${name} when:40d`;
  const url = india
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12_000) });
  if (!res.ok) return [];
  return parseNewsFeed(await res.text());
}

function growthPair(
  latest: number | null,
  prior: number | null,
  vendor: number | null,
  label: string,
): { value: number | null; detail: string | null } {
  let computed: number | null = null;
  if (latest != null && prior != null && Math.abs(prior) > 0) computed = (latest - prior) / Math.abs(prior);
  if (computed != null && vendor != null && Math.abs(computed - vendor) > 0.15) {
    return {
      value: null,
      detail: `${label} was not scored. The change computed from annual statements is ${pct(computed)}, while the vendor growth field is ${pct(vendor)}. They disagree by more than 15 percentage points, so neither figure was allowed to drive the stance.`,
    };
  }
  if (computed != null) {
    const agree =
      vendor == null
        ? "The vendor growth field was missing, so the statement change was used."
        : `The vendor growth field is ${pct(vendor)}, close enough to use the statement change.`;
    return { value: computed, detail: `${label} is the change between the two latest annual figures. ${agree}` };
  }
  if (vendor != null) {
    return {
      value: vendor,
      detail: `${label} uses the vendor growth field because a clean two-year statement change was not available.`,
    };
  }
  return { value: null, detail: null };
}

function ratioFromVendor(field: unknown, label: string, warnings: string[]): number | null {
  const raw = yRaw(field);
  if (raw == null) return null;
  const fmt = yFmt(field);
  if (fmt && fmt.includes("%")) {
    warnings.push(`${label} was supplied as ${fmt} and converted to a ratio of ${(raw / 100).toFixed(2)}.`);
    return raw / 100;
  }
  if (Math.abs(raw) > 5) {
    warnings.push(
      `${label} raw value was ${raw.toFixed(2)} without a percent label. Values above 5 are treated as a percent and converted to a ratio. That assumption is marked because the unit was ambiguous.`,
    );
    return raw / 100;
  }
  return raw;
}

function emptyPack(base: Partial<MetricPack> & Pick<MetricPack, "name" | "symbol" | "exchange" | "currency">): MetricPack {
  return {
    sector: null,
    industry: null,
    instrument: null,
    last: null,
    prev: null,
    dayChange: null,
    sma20: null,
    sma50: null,
    rsi: null,
    macd: null,
    macdSignal: null,
    macdHist: null,
    macdCross: "none",
    atr: null,
    volumeChange: null,
    return21: null,
    return63: null,
    return252: null,
    bars: 0,
    priceAsOf: null,
    vol252: null,
    volSample: 0,
    mddHorizon: null,
    mddFull: null,
    var95: null,
    varSample: 0,
    beta: null,
    drift: null,
    driftLow: null,
    driftHigh: null,
    driftSample: 0,
    newsScore: null,
    newsCount: 0,
    severeNegative: false,
    headlines: [],
    revenueGrowth: null,
    earningsGrowth: null,
    revenueGrowthDetail: null,
    earningsGrowthDetail: null,
    operatingMargin: null,
    profitMargin: null,
    grossMargin: null,
    roe: null,
    debtToEquity: null,
    trailingPE: null,
    priceToBook: null,
    evToEbitda: null,
    revenue: null,
    priorRevenue: null,
    netIncome: null,
    priorNetIncome: null,
    totalDebt: null,
    totalCash: null,
    statementAsOf: null,
    priorStatementAsOf: null,
    statementCount: 0,
    isFinancial: false,
    fundamentalsAvailable: false,
    warnings: [],
    ...base,
  };
}

function statementRows(list: unknown): Record<string, unknown>[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => !!row)
    .sort((a, b) => (yRaw(b.endDate) ?? 0) - (yRaw(a.endDate) ?? 0));
}

export async function buildBundle(query: string, horizon: Horizon): Promise<AnalysisBundle> {
  const looksSymbol = /^[A-Za-z0-9.^=-]{1,16}$/.test(query);
  let resolved: Resolved | null = null;
  if (!looksSymbol) {
    resolved = await searchEquity(query);
    if (!resolved) {
      throw new Error(`No listed equity matched “${query}”. Try a ticker such as RELIANCE.NS or AAPL.`);
    }
  } else {
    resolved = (await searchEquity(query)) ?? {
      symbol: query.toUpperCase(),
      name: query.toUpperCase(),
      exchange: "",
      sector: null,
      industry: null,
    };
  }

  const chart = await fetchChart(resolved.symbol);
  if (!chart) {
    throw new Error(`Prices for ${resolved.symbol} were not available. Check the ticker and try again.`);
  }
  const meta = chart.meta;
  const name = yText(meta.longName) ?? yText(meta.shortName) ?? resolved.name;
  const currency = yText(meta.currency) ?? "USD";
  const exchange = yText(meta.fullExchangeName) ?? yText(meta.exchangeName) ?? resolved.exchange;
  const instrument = yText(meta.instrumentType);
  const symbol = yText(meta.symbol) ?? resolved.symbol;

  const [summary, headlines] = await Promise.all([
    fetchSummary(symbol).catch(() => null),
    fetchHeadlines(name, currency).catch(() => [] as Headline[]),
  ]);

  const closes = chart.bars.map((b) => b.c);
  const last = closes[closes.length - 1] ?? null;
  const prev = closes[closes.length - 2] ?? null;
  const macd = macdLast(closes);
  const vols = chart.bars.map((b) => b.v);
  const volAvg = sma(vols.slice(0, -1), 20);
  const lastVol = vols[vols.length - 1] ?? 0;
  const rets = dailyReturns(closes);
  const retsYear = rets.slice(-252);
  const volSample = retsYear.length >= 30 ? retsYear : rets;
  const days = HORIZON_META[horizon].days;
  const windowCloses = closes.slice(-(days + 1));
  const sd = sampleStd(volSample);
  const driftSample = volSample.length;
  let drift: number | null = null;
  let driftLow: number | null = null;
  let driftHigh: number | null = null;
  if (sd != null && driftSample >= 60 && last != null) {
    const mean = volSample.reduce((a, b) => a + b, 0) / volSample.length;
    drift = mean * days;
    const band = sd * Math.sqrt(days);
    driftLow = drift - band;
    driftHigh = drift + band;
  }

  const warnings: string[] = [];
  const priceAsOf = isoFromUnix(chart.bars[chart.bars.length - 1]?.t ?? null);
  if (priceAsOf) {
    const age = (Date.now() - new Date(priceAsOf).getTime()) / 86_400_000;
    if (age > 7) warnings.push(`The newest price bar is ${Math.floor(age)} days old.`);
  }

  const financial = asRecord(summary?.financialData);
  const stats = asRecord(summary?.defaultKeyStatistics);
  const detail = asRecord(summary?.summaryDetail);
  const income = statementRows(asRecord(summary?.incomeStatementHistory)?.incomeStatementHistory);
  const latest = income[0] ?? null;
  const prior = income[1] ?? null;
  const revenue = latest ? yRaw(latest.totalRevenue) : null;
  const priorRevenue = prior ? yRaw(prior.totalRevenue) : null;
  const netIncome = latest ? yRaw(latest.netIncome) : null;
  const priorNetIncome = prior ? yRaw(prior.netIncome) : null;
  const statementAsOf = latest ? isoFromUnix(yRaw(latest.endDate)) : null;
  const priorStatementAsOf = prior ? isoFromUnix(yRaw(prior.endDate)) : null;
  if (statementAsOf) {
    const ageDays = (Date.now() - new Date(statementAsOf).getTime()) / 86_400_000;
    if (ageDays > 540) {
      warnings.push(`The latest annual statement ends ${prettyDate(statementAsOf)}, which is more than 18 months ago.`);
    }
  }

  const revenueGrowth = growthPair(revenue, priorRevenue, yRaw(financial?.revenueGrowth), "Revenue growth");
  const earningsGrowth = growthPair(netIncome, priorNetIncome, yRaw(financial?.earningsGrowth), "Earnings growth");
  if (revenueGrowth.detail && revenueGrowth.value == null) warnings.push(revenueGrowth.detail);
  if (earningsGrowth.detail && earningsGrowth.value == null) warnings.push(earningsGrowth.detail);

  const sector = resolved.sector;
  const industry = resolved.industry;
  const isFinancial = /bank|insurance|financial/i.test(`${sector ?? ""} ${industry ?? ""}`);
  const deWarnings: string[] = [];
  const debtToEquity = ratioFromVendor(financial?.debtToEquity, "Debt-to-equity", deWarnings);
  warnings.push(...deWarnings);

  let priceToBook = yRaw(detail?.priceToBook);
  const book = yRaw(stats?.bookValue);
  if (priceToBook == null && book != null && book > 0 && last != null) priceToBook = last / book;

  const roeRaw = yRaw(financial?.returnOnEquity);
  const roe = roeRaw == null ? null : Math.abs(roeRaw) > 2 ? roeRaw / 100 : roeRaw;

  const equityInstrument = !instrument || instrument === "EQUITY";
  if (!summary) warnings.push("Financial statements were not returned. Fundamental metrics were left blank.");
  if (income.length > 0 && !latest?.totalStockholderEquity) {
    // balance sheet often arrives without line items; mention only if we looked
  }
  const bs = statementRows(asRecord(summary?.balanceSheetHistory)?.balanceSheetStatements);
  if (summary && bs.length > 0 && Object.keys(bs[0] ?? {}).length <= 2) {
    warnings.push("The balance-sheet payload did not include line items, so equity-based ratios were not computed from it.");
  }

  const operatingMargin = yRaw(financial?.operatingMargins);
  const profitMargin = yRaw(financial?.profitMargins);
  const trailingPE = yRaw(detail?.trailingPE) ?? yRaw(detail?.trailingPe);
  const fundamentalsAvailable =
    equityInstrument &&
    [revenueGrowth.value, earningsGrowth.value, operatingMargin, profitMargin, trailingPE, debtToEquity, roe].filter(
      (v) => v != null,
    ).length >= 1;

  if (!equityInstrument) {
    warnings.push(`Instrument type is ${instrument}. Operating-company ratios were not scored.`);
  }

  const newsScore = headlines.length ? aggregateSentiment(headlines) : null;
  const severeNegative = headlines.some(
    (h) =>
      (h.events.includes("regulatory") || h.events.includes("litigation") || h.events.includes("distress")) &&
      h.sentiment < 0,
  );
  if (headlines.length > 0) {
    const newest = headlines
      .map((h) => (h.publishedAt ? new Date(h.publishedAt).getTime() : 0))
      .reduce((a, b) => Math.max(a, b), 0);
    if (newest) {
      const age = (Date.now() - newest) / 86_400_000;
      if (age > 30) warnings.push(`The newest headline is ${Math.floor(age)} days old.`);
    }
    const light = headlines.filter((h) => recencyWeight(h.publishedAt) < 0.5).length;
    if (light === headlines.length) warnings.push("Every headline is older than three weeks, so news weight in the score is reduced by the lexicon's recency weights.");
  } else {
    warnings.push("No headlines were returned for this name.");
  }

  const pack: MetricPack = emptyPack({
    name,
    symbol,
    exchange,
    currency,
    sector,
    industry,
    instrument,
    last,
    prev,
    dayChange: last != null && prev ? last / prev - 1 : null,
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    rsi: rsiWilder(closes),
    macd: macd?.macd ?? null,
    macdSignal: macd?.signal ?? null,
    macdHist: macd?.hist ?? null,
    macdCross:
      macd == null
        ? "none"
        : macd.prevHist <= 0 && macd.hist > 0
          ? "bullish"
          : macd.prevHist >= 0 && macd.hist < 0
            ? "bearish"
            : "none",
    atr: atrWilder(chart.bars),
    volumeChange: volAvg && lastVol ? lastVol / volAvg - 1 : null,
    return21: pctChange(closes, 21),
    return63: pctChange(closes, 63),
    return252: pctChange(closes, 252),
    bars: chart.bars.length,
    priceAsOf,
    vol252: annualizedVol(volSample),
    volSample: volSample.length,
    mddHorizon: maxDrawdown(windowCloses),
    mddFull: maxDrawdown(closes),
    var95: historicalVar(volSample),
    varSample: volSample.length,
    beta: yRaw(detail?.beta),
    drift,
    driftLow,
    driftHigh,
    driftSample,
    newsScore,
    newsCount: headlines.length,
    severeNegative,
    headlines,
    revenueGrowth: equityInstrument ? revenueGrowth.value : null,
    earningsGrowth: equityInstrument ? earningsGrowth.value : null,
    revenueGrowthDetail: equityInstrument ? revenueGrowth.detail : "Revenue growth was not scored for this instrument.",
    earningsGrowthDetail: equityInstrument ? earningsGrowth.detail : null,
    operatingMargin: equityInstrument ? operatingMargin : null,
    profitMargin: equityInstrument ? profitMargin : null,
    grossMargin: equityInstrument ? yRaw(financial?.grossMargins) : null,
    roe: equityInstrument ? roe : null,
    debtToEquity: equityInstrument ? debtToEquity : null,
    trailingPE: equityInstrument ? trailingPE : null,
    priceToBook: equityInstrument ? priceToBook : null,
    evToEbitda: equityInstrument ? yRaw(stats?.enterpriseToEbitda) : null,
    revenue,
    priorRevenue,
    netIncome,
    priorNetIncome,
    totalDebt: yRaw(financial?.totalDebt),
    totalCash: yRaw(financial?.totalCash),
    statementAsOf,
    priorStatementAsOf,
    statementCount: income.length,
    isFinancial,
    fundamentalsAvailable: equityInstrument ? fundamentalsAvailable : false,
    warnings,
  });

  const series = chart.bars.slice(-252).map((b) => ({
    d: new Date(b.t * 1000).toISOString().slice(0, 10),
    c: Number(b.c.toFixed(4)),
  }));

  return buildBundleShell(pack, horizon, series, new Date().toISOString());
}

import { a as money, c as prettyDate, d as stanceLabel, i as compactMoney, o as num, r as STANCE_THRESHOLD, s as pct, t as HORIZON_META } from "./types-9wxUdtPy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assess-Dv4Zk1eQ.js
function stanceFrom(score) {
	if (score == null || Number.isNaN(score)) return "insufficient_data";
	if (score >= .22) return "bullish";
	if (score <= -.22) return "bearish";
	return "neutral";
}
function weighted(bits) {
	const w = bits.reduce((a, b) => a + b.weight, 0);
	if (w <= 0) return null;
	return bits.reduce((a, b) => a + b.weight * b.value, 0) / w;
}
function ev(agent, i, claim, source, observedAt, sourceUrl, pole) {
	return {
		id: `${agent}-${i}-${claim.slice(0, 24)}`,
		claim,
		source,
		observedAt,
		sourceUrl,
		pole
	};
}
function riskFrom(vol, mdd) {
	if (vol == null) return "insufficient_data";
	const order = [
		"low",
		"moderate",
		"elevated",
		"high"
	];
	let idx = vol < .18 ? 0 : vol < .28 ? 1 : vol < .42 ? 2 : 3;
	if (mdd != null && mdd <= -.4) idx = Math.min(3, idx + 1);
	return order[idx] ?? "insufficient_data";
}
function horizonReturn(pack, horizon) {
	if (horizon === "1m") return pack.return21;
	if (horizon === "3m") return pack.return63;
	return pack.return252;
}
function technicalBits(pack, horizon) {
	const bits = [];
	const ccy = pack.currency;
	const weights = horizon === "1m" ? {
		sma20: .22,
		sma50: .16,
		macd: .3,
		rsi: .18,
		ret: .14
	} : horizon === "3m" ? {
		sma20: .16,
		sma50: .26,
		macd: .24,
		rsi: .14,
		ret: .2
	} : {
		sma20: .1,
		sma50: .28,
		macd: .16,
		rsi: .1,
		ret: .36
	};
	if (pack.last != null && pack.sma50 != null) {
		const up = pack.last >= pack.sma50;
		bits.push({
			weight: weights.sma50,
			value: up ? 1 : -1,
			pole: up ? "support" : "caution",
			claim: `The last close (${money(pack.last, ccy)}) is ${up ? "above" : "below"} the 50-day average (${money(pack.sma50, ccy)}).`,
			source: "Computed from daily closes"
		});
	}
	if (pack.last != null && pack.sma20 != null) {
		const up = pack.last >= pack.sma20;
		bits.push({
			weight: weights.sma20,
			value: up ? 1 : -1,
			pole: up ? "support" : "caution",
			claim: `The last close is ${up ? "above" : "below"} the 20-day average (${money(pack.sma20, ccy)}).`,
			source: "Computed from daily closes"
		});
	}
	if (pack.macdHist != null) {
		const up = pack.macdHist > 0;
		const flat = Math.abs(pack.macdHist) < 1e-8;
		const cross = pack.macdCross === "none" ? "" : ` The histogram just crossed ${pack.macdCross === "bullish" ? "above" : "below"} zero.`;
		bits.push({
			weight: weights.macd,
			value: flat ? 0 : up ? 1 : -1,
			pole: flat ? "context" : up ? "support" : "caution",
			claim: flat ? "The MACD histogram is flat." : `The MACD histogram is ${up ? "positive" : "negative"} (${num(pack.macdHist, 2)}).${cross}`,
			source: "MACD 12/26/9 computed from daily closes"
		});
	}
	if (pack.rsi != null) {
		let value = 0;
		let pole = "context";
		let claim = `RSI (14, Wilder) is ${num(pack.rsi, 1)}.`;
		if (pack.rsi >= 70) {
			value = horizon === "1m" ? -.45 : .15;
			pole = horizon === "1m" ? "caution" : "context";
			claim += horizon === "1m" ? " On a one-month horizon that is treated as stretched, not as a fresh bullish signal." : " That is firm. On a longer horizon it is not, by itself, a sell signal.";
		} else if (pack.rsi <= 30) {
			value = horizon === "1m" ? .35 : -.2;
			pole = horizon === "1m" ? "support" : "caution";
			claim += horizon === "1m" ? " On a one-month horizon a washed-out RSI is a modest positive, not a reversal forecast." : " A very low RSI is treated cautiously on a longer horizon because weakness can persist.";
		} else if (pack.rsi >= 55) {
			value = .4;
			pole = "support";
			claim += " Momentum is positive without being extreme.";
		} else if (pack.rsi <= 45) {
			value = -.4;
			pole = "caution";
			claim += " Momentum is soft.";
		} else claim += " Momentum is mid-range.";
		bits.push({
			weight: weights.rsi,
			value,
			pole,
			claim,
			source: "RSI computed from daily closes"
		});
	}
	const ret = horizonReturn(pack, horizon);
	if (ret != null) {
		const value = Math.max(-1, Math.min(1, ret / .12));
		bits.push({
			weight: weights.ret,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `The price return over the ${HORIZON_META[horizon].label.toLowerCase()} window (${HORIZON_META[horizon].days} sessions) is ${pct(ret)}.`,
			source: "Computed from daily closes"
		});
	}
	return bits;
}
function technicalReport(pack, horizon) {
	const bits = technicalBits(pack, horizon);
	const score = bits.reduce((a, b) => a + b.weight, 0) >= .45 ? weighted(bits) : null;
	const assessment = stanceFrom(score);
	const evidence = bits.map((b, i) => ev("technical", i, b.claim, b.source, pack.priceAsOf, null, b.pole));
	if (pack.volumeChange != null) evidence.push(ev("technical", evidence.length, `The latest volume is ${pct(pack.volumeChange)} versus the prior 20-session average. Volume confirms activity, not direction, so it is not in the stance score.`, "Computed from daily volume", pack.priceAsOf, null, "context"));
	if (pack.drift != null && pack.driftLow != null && pack.driftHigh != null) evidence.push(ev("technical", evidence.length, `A historical-drift baseline over ${HORIZON_META[horizon].days} sessions is ${pct(pack.drift)}, with a one-standard-deviation band of ${pct(pack.driftLow)} to ${pct(pack.driftHigh)}. It restates the past average. It is not a trained forecast and it does not set this stance.`, `Mean and sample deviation of ${pack.driftSample} daily returns`, pack.priceAsOf, null, "context"));
	const summary = assessment === "insufficient_data" ? `There are not enough daily prices to assess ${pack.name} over ${HORIZON_META[horizon].label.toLowerCase()}. Missing indicators were left blank.` : `The technical stance on ${pack.name} for ${HORIZON_META[horizon].label.toLowerCase()} is ${stanceLabel(assessment).toLowerCase()}. ${bits.slice(0, 3).map((b) => b.claim).join(" ")} The drift baseline, when shown, is excluded from this stance.`;
	const metrics = [
		{
			label: "Last close",
			value: money(pack.last, pack.currency)
		},
		{
			label: "RSI (14)",
			value: num(pack.rsi, 1)
		},
		{
			label: "MACD histogram",
			value: num(pack.macdHist, 2)
		},
		{
			label: "SMA 20",
			value: money(pack.sma20, pack.currency)
		},
		{
			label: "SMA 50",
			value: money(pack.sma50, pack.currency)
		},
		{
			label: "ATR (14)",
			value: money(pack.atr, pack.currency)
		},
		{
			label: "Volume vs 20-day",
			value: pct(pack.volumeChange)
		},
		{
			label: "21-session return",
			value: pct(pack.return21)
		},
		{
			label: "63-session return",
			value: pct(pack.return63)
		},
		{
			label: "252-session return",
			value: pct(pack.return252)
		}
	];
	return {
		agent: "technical",
		title: "Technical analyst",
		assessment,
		signal: score,
		riskLevel: null,
		summary,
		evidence,
		limitations: [
			"Indicators describe the loaded daily history. They are not a forecast of the next price.",
			"The drift baseline is not a trained model and is excluded from the stance.",
			pack.bars < 200 ? "History is shorter than a full trading year, so longer-window returns are partial or missing." : "A full trading year of daily bars was available for the longer averages and the annual return."
		],
		dataAsOf: pack.priceAsOf,
		metrics
	};
}
function newsReport(pack, horizon) {
	const severeCap = pack.severeNegative;
	const stance = pack.newsCount < 2 || pack.newsScore == null ? "insufficient_data" : severeCap && pack.newsScore > -.15 ? "neutral" : pack.newsScore >= .15 ? "bullish" : pack.newsScore <= -.15 ? "bearish" : "neutral";
	const signal = stance === "insufficient_data" || pack.newsScore == null ? null : severeCap ? Math.min(pack.newsScore, 0) : pack.newsScore;
	const evidence = [];
	if (pack.newsScore != null) evidence.push(ev("news", 0, `The recency-weighted headline lexicon score is ${num(pack.newsScore, 2)} on a scale from −1 to +1. This is not a probability and not an expected return.${severeCap ? " A severe theme (regulatory, litigation, or distress language) caps the news stance so it cannot be bullish." : ""}`, `${pack.newsCount} headlines`, pack.headlines[0]?.publishedAt ?? null, null, pack.newsScore > .15 && !severeCap ? "support" : pack.newsScore < -.15 ? "caution" : "context"));
	const ranked = [...pack.headlines].sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment));
	for (const h of ranked.slice(0, 4)) {
		const pole = h.sentiment > .2 ? "support" : h.sentiment < -.2 ? "caution" : "context";
		const tags = h.events.length ? ` Tagged: ${h.events.join(", ")}.` : "";
		evidence.push(ev("news", evidence.length, `${h.title}${tags} Lexicon score ${num(h.sentiment, 2)}.`, h.publisher, h.publishedAt, h.url, pole));
	}
	const horizonNote = horizon === "1m" ? "For a one-month horizon, headlines dominate more of the chair's weight, but they still do not prove a price move." : horizon === "12m" ? "For a twelve-month horizon, headlines are context. They are not the main driver." : "Headlines and the other analysts share the chair's weight on this horizon.";
	return {
		agent: "news",
		title: "News analyst",
		assessment: stance,
		signal,
		riskLevel: null,
		summary: stance === "insufficient_data" ? `The news analyst does not have enough recent headlines to assess ${pack.name}. Fewer than two usable titles were returned, so nothing was invented to fill the gap.` : `The news stance is ${stanceLabel(stance).toLowerCase()} from ${pack.newsCount} headlines. The lexicon score is ${num(pack.newsScore, 2)}. ${horizonNote}`,
		evidence,
		limitations: [
			"Scores use headlines only, from a title lexicon. Article bodies were not read, and sarcasm or idioms can be misread.",
			"A negative headline is not evidence the price will fall. The move may already have happened.",
			"Links point at the aggregator result that supplied the headline, not a filing.",
			severeCap ? "Severe language in at least one headline prevents a bullish news stance." : "No severe regulatory, litigation, or distress theme was detected by the keyword rules."
		],
		dataAsOf: pack.headlines.find((h) => h.publishedAt)?.publishedAt ?? null,
		metrics: [
			{
				label: "Headlines used",
				value: String(pack.newsCount)
			},
			{
				label: "Lexicon score",
				value: pack.newsScore == null ? "—" : num(pack.newsScore, 2)
			},
			{
				label: "Severe theme",
				value: pack.severeNegative ? "Yes" : "No"
			}
		]
	};
}
function growthSignal(g) {
	if (g >= .12) return .8;
	if (g >= .03) return .35;
	if (g >= -.02) return 0;
	if (g >= -.08) return -.4;
	return -.75;
}
function fundamentalReport(pack) {
	const bits = [];
	const ccy = pack.currency;
	if (pack.revenueGrowth != null) {
		const value = growthSignal(pack.revenueGrowth);
		bits.push({
			weight: 1,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Revenue growth used in the score is ${pct(pack.revenueGrowth)}. ${pack.revenueGrowthDetail ?? ""}`.trim(),
			source: "Annual figures or vendor growth field, after a discrepancy check"
		});
	} else if (pack.revenueGrowthDetail) bits.push({
		weight: 0,
		value: 0,
		pole: "context",
		claim: pack.revenueGrowthDetail,
		source: "Annual income statements compared with the vendor growth field"
	});
	if (pack.earningsGrowth != null) {
		const value = growthSignal(pack.earningsGrowth);
		bits.push({
			weight: 1,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Earnings growth used in the score is ${pct(pack.earningsGrowth)}. ${pack.earningsGrowthDetail ?? ""}`.trim(),
			source: "Annual net income or vendor earnings-growth field"
		});
	} else if (pack.earningsGrowthDetail) bits.push({
		weight: 0,
		value: 0,
		pole: "context",
		claim: pack.earningsGrowthDetail,
		source: "Annual net income compared with the vendor earnings-growth field"
	});
	if (pack.operatingMargin != null) {
		const m = pack.operatingMargin;
		const value = m >= .18 ? .55 : m >= .1 ? .3 : m >= .04 ? .05 : m >= 0 ? -.25 : -.7;
		bits.push({
			weight: 1,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Operating margin is ${pct(m)}.`,
			source: "Vendor financial margin field"
		});
	} else if (pack.profitMargin != null) {
		const m = pack.profitMargin;
		const value = m >= .12 ? .4 : m >= .05 ? .2 : m >= 0 ? 0 : -.55;
		bits.push({
			weight: 1,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Net profit margin is ${pct(m)}. Operating margin was not available, so this stands in for profitability.`,
			source: "Vendor financial margin field"
		});
	}
	if (!pack.isFinancial && pack.debtToEquity != null) {
		const d = pack.debtToEquity;
		const value = d <= .4 ? .25 : d <= 1 ? .05 : d <= 1.8 ? -.3 : -.65;
		bits.push({
			weight: .8,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Debt-to-equity used in the score is ${num(d, 2)}. ${pack.totalDebt != null ? `Vendor total debt is ${compactMoney(pack.totalDebt, ccy)}. ` : ""}${pack.totalCash != null ? `Vendor total cash is ${compactMoney(pack.totalCash, ccy)}.` : ""}`.trim(),
			source: "Vendor debt-to-equity field, converted to a ratio when the vendor labels it as a percent"
		});
	}
	if (pack.trailingPE != null && pack.trailingPE > 0) {
		const pe = pack.trailingPE;
		const g = pack.revenueGrowth;
		let value = 0;
		if (pe >= 45 && (g == null || g < .2)) value = -.55;
		else if (pe >= 32 && (g == null || g < .12)) value = -.3;
		else if (pe <= 16 && (g == null || g >= 0)) value = .25;
		bits.push({
			weight: .85,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Trailing P/E is ${num(pe, 1)}. The valuation signal uses absolute bands, not a peer set. ${g == null ? "Revenue growth was not scored, so a high multiple is treated more cautiously." : `Scored revenue growth is ${pct(g)}.`}`,
			source: "Vendor trailing P/E"
		});
	}
	if (pack.roe != null) {
		const value = pack.roe >= .15 ? .35 : pack.roe >= .08 ? .1 : pack.roe >= 0 ? -.1 : -.45;
		bits.push({
			weight: .6,
			value,
			pole: value > .15 ? "support" : value < -.15 ? "caution" : "context",
			claim: `Return on equity is ${pct(pack.roe)}.`,
			source: "Vendor return on equity"
		});
	}
	const scored = bits.filter((b) => b.weight > 0);
	const score = !pack.fundamentalsAvailable || scored.length < 2 ? null : weighted(scored);
	const assessment = stanceFrom(score);
	const evidence = bits.map((b, i) => ev("fundamental", i, b.claim, b.source, pack.statementAsOf, null, b.pole));
	if (pack.revenue != null) evidence.push(ev("fundamental", evidence.length, `Latest annual revenue is ${compactMoney(pack.revenue, ccy)}${pack.priorRevenue != null ? ` versus ${compactMoney(pack.priorRevenue, ccy)} in the prior annual period` : ""}. ${pack.statementAsOf ? `Latest period ends ${prettyDate(pack.statementAsOf)}.` : ""} ${pack.priorStatementAsOf ? `Prior period ends ${prettyDate(pack.priorStatementAsOf)}.` : ""}`.trim(), "Vendor annual income statement", pack.statementAsOf, null, "context"));
	if (pack.evToEbitda != null) evidence.push(ev("fundamental", evidence.length, `EV/EBITDA is ${num(pack.evToEbitda, 1)}. It is shown for context and is not scored, so it is not double-counted with P/E.`, "Vendor enterprise value multiple", pack.statementAsOf, null, "context"));
	return {
		agent: "fundamental",
		title: "Fundamental analyst",
		assessment,
		signal: score,
		riskLevel: null,
		summary: assessment === "insufficient_data" ? `The fundamental analyst cannot score ${pack.name}. Fewer than two usable, consistent metrics were available, or the instrument is outside the operating-company ratios. Nothing was estimated to fill the gap.` : `The fundamental stance is ${stanceLabel(assessment).toLowerCase()}. This is a view of the business and the valuation, not a one-week trade. ${scored.slice(0, 3).map((b) => b.claim).join(" ")}`,
		evidence,
		limitations: [
			"Annual figures are not mixed with quarterly ones. Growth is scored only when the statement change and the vendor growth field do not disagree by more than 15 percentage points.",
			"Thresholds are absolute, not a sector model. Banks and insurers skip the leverage score because a non-financial debt rule would mislead.",
			pack.isFinancial ? "This company is tagged as a bank, insurer, or other financial. Debt-to-equity was not scored." : "Debt-to-equity is scored only for non-financial companies.",
			"Price-to-book and EV/EBITDA, when shown, are context unless a metric row says they entered the score."
		],
		dataAsOf: pack.statementAsOf,
		metrics: [
			{
				label: "Revenue growth",
				value: pack.revenueGrowth != null ? pct(pack.revenueGrowth) : "Not scored"
			},
			{
				label: "Earnings growth",
				value: pack.earningsGrowth != null ? pct(pack.earningsGrowth) : "Not scored"
			},
			{
				label: "Operating margin",
				value: pct(pack.operatingMargin)
			},
			{
				label: "Profit margin",
				value: pct(pack.profitMargin)
			},
			{
				label: "Debt/equity",
				value: pack.debtToEquity == null ? "—" : num(pack.debtToEquity, 2)
			},
			{
				label: "Trailing P/E",
				value: num(pack.trailingPE, 1)
			},
			{
				label: "P/B",
				value: num(pack.priceToBook, 2)
			},
			{
				label: "EV/EBITDA",
				value: num(pack.evToEbitda, 1)
			},
			{
				label: "ROE",
				value: pct(pack.roe)
			},
			{
				label: "Latest revenue",
				value: compactMoney(pack.revenue, ccy)
			},
			{
				label: "Latest net income",
				value: compactMoney(pack.netIncome, ccy)
			},
			{
				label: "Statement period",
				value: prettyDate(pack.statementAsOf)
			}
		]
	};
}
function riskReport(pack, horizon) {
	const mdd = pack.mddHorizon ?? pack.mddFull;
	const level = riskFrom(pack.vol252, mdd);
	const evidence = [];
	const pole = level === "high" || level === "elevated" ? "caution" : "context";
	if (pack.vol252 != null) evidence.push(ev("risk", 0, `Annualized volatility is ${pct(pack.vol252)}, from the sample standard deviation of ${pack.volSample} daily returns times the square root of 252.`, "Computed from daily closes", pack.priceAsOf, null, pole));
	if (pack.mddHorizon != null) evidence.push(ev("risk", evidence.length, `Maximum drawdown inside the ${HORIZON_META[horizon].label.toLowerCase()} window is ${pct(pack.mddHorizon)}.`, "Peak-to-trough on daily closes in the horizon window", pack.priceAsOf, null, pack.mddHorizon <= -.2 ? "caution" : "context"));
	if (pack.mddFull != null) evidence.push(ev("risk", evidence.length, `Maximum drawdown over the full loaded history is ${pct(pack.mddFull)}.`, "Peak-to-trough on all loaded daily closes", pack.priceAsOf, null, "context"));
	if (pack.var95 != null) evidence.push(ev("risk", evidence.length, `One-day historical VaR at 95% is ${pct(pack.var95)} (${pack.varSample} daily returns, nearest-rank 5th percentile). A day worse than this happened about one time in twenty in that sample. It is not a forecast.`, "Computed from daily returns", pack.priceAsOf, null, pack.var95 <= -.03 ? "caution" : "context"));
	if (pack.beta != null) evidence.push(ev("risk", evidence.length, `Vendor beta is ${num(pack.beta, 2)}. The benchmark is the vendor's, and it was not recomputed here. Beta is not in the risk grade.`, "Vendor summary statistic", pack.priceAsOf, null, "context"));
	if (pack.atr != null && pack.last) evidence.push(ev("risk", evidence.length, `ATR (14) is ${money(pack.atr, pack.currency)}, about ${pct(pack.atr / pack.last)} of the last close. It describes recent range. It is not in the risk grade.`, "ATR computed from daily high, low, and close", pack.priceAsOf, null, "context"));
	return {
		agent: "risk",
		title: "Risk analyst",
		assessment: "neutral",
		signal: null,
		riskLevel: level,
		summary: level === "insufficient_data" ? `Risk for ${pack.name} is not graded. There are not enough daily returns to compute volatility. Missing risk is not treated as low risk.` : `Measured risk is ${level}. Annualized volatility is ${pct(pack.vol252)}. ${pack.mddHorizon != null ? `Drawdown over the selected window is ${pct(pack.mddHorizon)}.` : ""} This agent does not issue a bullish or bearish call. The chair uses the grade as a constraint.`,
		evidence,
		limitations: [
			"This agent does not vote bullish or bearish. A neutral label on the internal record means “not a directional call.”",
			"Volatility, drawdown, and VaR are historical. They are not a prediction of future loss.",
			"The risk grade uses volatility bands (under 18% low, under 28% moderate, under 42% elevated, otherwise high) and raises the grade one step if horizon drawdown is −40% or worse.",
			"Beta, when shown, is the vendor figure and is not in the grade."
		],
		dataAsOf: pack.priceAsOf,
		metrics: [
			{
				label: "Annualized volatility",
				value: pct(pack.vol252)
			},
			{
				label: "Drawdown in horizon",
				value: pct(pack.mddHorizon)
			},
			{
				label: "Drawdown, full history",
				value: pct(pack.mddFull)
			},
			{
				label: "1-day VaR 95%",
				value: pct(pack.var95)
			},
			{
				label: "Vendor beta",
				value: num(pack.beta, 2)
			},
			{
				label: "Return sample",
				value: pack.volSample ? String(pack.volSample) : "—"
			}
		]
	};
}
var BASE_WEIGHTS = {
	"1m": {
		technical: .4,
		news: .4,
		fundamental: .2
	},
	"3m": {
		technical: .3,
		news: .3,
		fundamental: .4
	},
	"12m": {
		technical: .2,
		news: .2,
		fundamental: .6
	}
};
function toScore(signal) {
	if (signal == null || Number.isNaN(signal)) return null;
	return Math.max(-1, Math.min(1, signal));
}
function judge(pack, horizon, scenario = false) {
	const technical = technicalReport(pack, horizon);
	const news = newsReport(pack, horizon);
	const fundamental = fundamentalReport(pack);
	const risk = riskReport(pack, horizon);
	const reports = {
		technical,
		news,
		fundamental,
		risk
	};
	const base = BASE_WEIGHTS[horizon];
	const usable = [
		{
			agent: "Technical",
			stance: technical.assessment,
			signal: technical.signal,
			weight: base.technical
		},
		{
			agent: "News",
			stance: news.assessment,
			signal: news.signal,
			weight: base.news
		},
		{
			agent: "Fundamental",
			stance: fundamental.assessment,
			signal: fundamental.signal,
			weight: base.fundamental
		}
	].filter((d) => toScore(d.signal) != null);
	const weightSum = usable.reduce((a, d) => a + d.weight, 0);
	const weights = usable.map((d) => ({
		agent: d.agent,
		weight: weightSum === 0 ? 0 : d.weight / weightSum,
		stance: d.stance,
		signal: toScore(d.signal)
	}));
	const rawScore = usable.length < 2 || weightSum === 0 ? null : usable.reduce((a, d) => a + d.weight / weightSum * toScore(d.signal), 0);
	let finalScore = rawScore;
	let capNote = null;
	const riskLevel = risk.riskLevel ?? "insufficient_data";
	if (finalScore != null && finalScore > 0) {
		if (riskLevel === "high") {
			finalScore = Math.min(finalScore, 0);
			capNote = "High measured risk capped a positive directional score at neutral. The risk grade is not itself a bearish vote.";
		} else if (riskLevel === "elevated" && horizon !== "12m") {
			if (finalScore >= .22) {
				finalScore = Math.min(finalScore, STANCE_THRESHOLD - .01);
				capNote = "Elevated risk capped a bullish short-horizon score at neutral. On a 12-month horizon this cap is not applied.";
			}
		}
	}
	const assessment = usable.length < 2 ? "insufficient_data" : stanceFrom(finalScore);
	const supporting = collect(reports, "support");
	const opposing = collect(reports, "caution");
	const disagreements = buildDisagreements(technical.assessment, news.assessment, fundamental.assessment);
	const missing = [];
	if (technical.assessment === "insufficient_data") missing.push("Technical indicators were incomplete.");
	if (news.assessment === "insufficient_data") missing.push("News coverage was too thin to score.");
	if (fundamental.assessment === "insufficient_data") missing.push("Fundamental metrics were incomplete or inconsistent.");
	if (riskLevel === "insufficient_data") missing.push("Risk was not graded. That absence is not treated as low risk.");
	const changeConditions = buildChanges(pack, technical, news, fundamental, riskLevel);
	const weightText = weights.map((w) => `${w.agent} ${Math.round(w.weight * 100)}% (signal ${w.signal.toFixed(2)}, ${stanceLabel(w.stance).toLowerCase()})`).join(", ");
	const lead = scenario ? `Stressed assumptions, not the observed data. ` : "";
	return {
		reports,
		committee: {
			assessment,
			riskLevel,
			summary: assessment === "insufficient_data" ? `${lead}The chair will not issue a directional assessment for ${pack.name}. Fewer than two analysts produced a stance, so the gap is reported instead of filled.${weightText ? ` Weights among what could be scored: ${weightText}.` : ""}` : `${lead}The committee assessment for ${pack.name} over ${HORIZON_META[horizon].label.toLowerCase()} is ${stanceLabel(assessment).toLowerCase()}. It is not a vote. ${weightText ? `Renormalized weights: ${weightText}.` : ""} ${capNote ?? "No risk cap was applied."} ${disagreements[0] ? disagreements[0].detail : ""}`,
			supporting,
			opposing,
			disagreements,
			missing,
			changeConditions,
			weights,
			rawScore,
			finalScore,
			capNote,
			narrativeSource: "rules"
		}
	};
}
function collect(reports, pole) {
	const out = [];
	for (const key of [
		"technical",
		"news",
		"fundamental",
		"risk"
	]) for (const item of reports[key].evidence) if (item.pole === pole) out.push(`${reports[key].title}: ${item.claim}`);
	return out.slice(0, 5);
}
function buildDisagreements(tech, news, fund) {
	const named = [
		{
			name: "Technical",
			stance: tech
		},
		{
			name: "News",
			stance: news
		},
		{
			name: "Fundamental",
			stance: fund
		}
	].filter((d) => d.stance !== "insufficient_data");
	const distinct = new Set(named.map((d) => d.stance));
	if (named.length < 2) return [{
		title: "Not enough directional views to compare",
		detail: "Fewer than two analysts produced a directional stance, so there is no conflict to resolve. The missing reports were not replaced with a guess.",
		agents: named.map((d) => d.name)
	}];
	if (distinct.size === 1) return [{
		title: "No split among the directional analysts",
		detail: `The scored analysts agree on ${named[0].stance}. Agreement is not the same thing as being right, and the risk grade can still cap a bullish reading.`,
		agents: named.map((d) => d.name)
	}];
	const out = [];
	if (tech !== fund && tech !== "insufficient_data" && fund !== "insufficient_data") out.push({
		title: "Price structure versus the business",
		detail: `Technical is ${tech} while fundamental is ${fund}. Those are different questions: recent trading conditions on this horizon, versus the annual statements and valuation. The chair does not let the larger count win.`,
		agents: ["Technical", "Fundamental"]
	});
	if (news !== fund && news !== "insufficient_data" && fund !== "insufficient_data") out.push({
		title: "Headlines versus the statements",
		detail: `News is ${news} while fundamental is ${fund}. A headline can matter before it shows up in a filing, and a filing can matter after the headline has faded. Neither is assumed to dominate.`,
		agents: ["News", "Fundamental"]
	});
	if (tech !== news && tech !== "insufficient_data" && news !== "insufficient_data") out.push({
		title: "Tape versus headlines",
		detail: `Technical is ${tech} while news is ${news}. The price may already reflect the stories, or the stories may not be in the price. The lexicon cannot tell those apart.`,
		agents: ["Technical", "News"]
	});
	return out;
}
function buildChanges(pack, technical, news, fundamental, riskLevel) {
	const changes = [];
	if (pack.revenueGrowth == null && pack.revenueGrowthDetail) changes.push("Audited figures that resolve the revenue-growth discrepancy, so growth can be scored instead of set aside.");
	if (pack.earningsGrowth == null && pack.earningsGrowthDetail) changes.push("Earnings figures that agree with each other across the vendor fields, so earnings growth can be scored.");
	if (technical.assessment === "bearish" || pack.macdHist != null && pack.macdHist < 0) changes.push("A positive MACD histogram with the close holding above the 20-day average.");
	if (pack.severeNegative) changes.push("A primary-source update that resolves or withdraws the severe headline theme.");
	if (fundamental.assessment === "insufficient_data") changes.push("A complete annual statement set with matching growth fields.");
	if (riskLevel === "high" || riskLevel === "elevated") changes.push("A fresh window of daily returns with lower realized volatility and a shallower drawdown.");
	if (news.assessment === "insufficient_data") changes.push("Several recent headlines from identifiable publishers.");
	if (pack.trailingPE != null && pack.trailingPE >= 32) changes.push("Earnings catching up to the price, or a lower trailing multiple, without a drop in operating margin.");
	if (changes.length === 0) changes.push("A new filing or a clear indicator crossover. Nothing in this run is sitting on a single trigger.");
	return changes.slice(0, 4);
}
function applyScenario(pack, scenario) {
	const next = {
		...pack,
		headlines: pack.headlines.map((h) => ({
			...h,
			events: [...h.events]
		})),
		warnings: [...pack.warnings]
	};
	const notes = [];
	if (Math.abs(scenario.revenueGrowthDelta) > 1e-4) {
		if (next.revenueGrowth == null) notes.push("The revenue-growth shock was not applied. Observed growth was missing or set aside as inconsistent.");
		else {
			next.revenueGrowth = next.revenueGrowth + scenario.revenueGrowthDelta;
			next.revenueGrowthDetail = `Scenario shock of ${pct(scenario.revenueGrowthDelta, 0)} points applied to the observed growth rate. This is not a reported figure.`;
			notes.push(next.revenueGrowthDetail);
		}
	}
	if (Math.abs(scenario.volMultiplier - 1) > .001) {
		if (next.vol252 == null) notes.push("The volatility shock was not applied because observed volatility was missing.");
		else {
			next.vol252 = next.vol252 * scenario.volMultiplier;
			notes.push(`Volatility was multiplied by ${num(scenario.volMultiplier, 1)}. The drawdown and VaR figures were left at their observed values.`);
		}
	}
	if (Math.abs(scenario.newsShift) > .001) {
		if (next.newsScore == null) notes.push("The news shock was not applied because there was no lexicon score.");
		else {
			next.newsScore = Math.max(-1, Math.min(1, next.newsScore + scenario.newsShift));
			notes.push(`The headline lexicon score was shifted by ${num(scenario.newsShift, 1)}. The underlying headlines were not changed.`);
		}
	}
	return {
		pack: next,
		notes
	};
}
function buildBundleShell(pack, horizon, series, generatedAt) {
	const { reports, committee } = judge(pack, horizon, false);
	return {
		id: `${pack.symbol}-${horizon}-${generatedAt}`,
		generatedAt,
		horizon,
		company: {
			symbol: pack.symbol,
			name: pack.name,
			exchange: pack.exchange,
			currency: pack.currency,
			sector: pack.sector,
			industry: pack.industry,
			instrument: pack.instrument
		},
		pack,
		reports,
		committee,
		series,
		modelProse: null,
		modelNote: null
	};
}
//#endregion
export { buildBundleShell as n, judge as r, applyScenario as t };

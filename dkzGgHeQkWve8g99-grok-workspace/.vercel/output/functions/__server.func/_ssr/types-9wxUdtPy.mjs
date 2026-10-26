//#region node_modules/.nitro/vite/services/ssr/assets/types-9wxUdtPy.js
function pct(n, digits = 1) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${(n * 100).toFixed(digits)}%`;
}
function num(n, digits = 2) {
	if (n == null || !Number.isFinite(n)) return "—";
	return n.toLocaleString("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
}
function money(n, currency) {
	if (n == null || !Number.isFinite(n)) return "—";
	const code = currency && currency.length === 3 ? currency : "USD";
	try {
		return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
			style: "currency",
			currency: code,
			maximumFractionDigits: 2
		}).format(n);
	} catch {
		return `${n.toFixed(2)} ${code}`;
	}
}
function compactMoney(n, currency) {
	if (n == null || !Number.isFinite(n)) return "—";
	const code = currency && currency.length === 3 ? currency : "USD";
	try {
		return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
			style: "currency",
			currency: code,
			notation: "compact",
			maximumFractionDigits: 2
		}).format(n);
	} catch {
		return `${n.toFixed(0)} ${code}`;
	}
}
function prettyDate(iso) {
	if (!iso) return "unknown date";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "unknown date";
	return d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	});
}
function stanceLabel(s) {
	switch (s) {
		case "bullish": return "Bullish";
		case "bearish": return "Bearish";
		case "neutral": return "Neutral";
		default: return "Insufficient data";
	}
}
function riskLabel(s) {
	switch (s) {
		case "low": return "Low";
		case "moderate": return "Moderate";
		case "elevated": return "Elevated";
		case "high": return "High";
		default: return "Insufficient data";
	}
}
var STANCE_THRESHOLD = .22;
var HORIZON_META = {
	"1m": {
		label: "1 month",
		short: "1M",
		days: 21,
		blurb: "Near-term price and headlines weigh more than the annual statements."
	},
	"3m": {
		label: "3 months",
		short: "3M",
		days: 63,
		blurb: "Momentum, headlines, and the business share the decision."
	},
	"12m": {
		label: "12 months",
		short: "12M",
		days: 252,
		blurb: "The business and valuation weigh more than short-term momentum."
	}
};
var NEUTRAL_SCENARIO = {
	revenueGrowthDelta: 0,
	volMultiplier: 1,
	newsShift: 0
};
function scenarioActive(s) {
	return Math.abs(s.revenueGrowthDelta) > 1e-4 || Math.abs(s.volMultiplier - 1) > .001 || Math.abs(s.newsShift) > .001;
}
//#endregion
export { money as a, prettyDate as c, stanceLabel as d, compactMoney as i, riskLabel as l, NEUTRAL_SCENARIO as n, num as o, STANCE_THRESHOLD as r, pct as s, HORIZON_META as t, scenarioActive as u };

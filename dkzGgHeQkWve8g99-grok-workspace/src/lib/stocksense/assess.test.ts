import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge } from "./assess.ts";
import type { MetricPack } from "./types.ts";

function metricPack(overrides: Partial<MetricPack> = {}): MetricPack {
  return {
    name: "Example Corp",
    symbol: "EXM",
    exchange: "NASDAQ",
    currency: "USD",
    sector: null,
    industry: null,
    instrument: "EQUITY",
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
    ...overrides,
  };
}

describe("committee decision rules", () => {
  it("reports insufficient evidence instead of treating missing inputs as bearish", () => {
    const result = judge(metricPack(), "3m");

    assert.equal(result.committee.assessment, "insufficient_data");
    assert.equal(result.committee.rawScore, null);
    assert.equal(result.reports.technical.assessment, "insufficient_data");
    assert.equal(result.reports.news.assessment, "insufficient_data");
    assert.equal(result.reports.fundamental.assessment, "insufficient_data");
    assert.equal(result.reports.risk.riskLevel, "insufficient_data");
    assert.equal(result.committee.missing.length, 4);
  });

  it("uses risk as a cap, not a directional vote", () => {
    const result = judge(
      metricPack({
        last: 120,
        sma20: 110,
        sma50: 100,
        rsi: 60,
        macdHist: 2,
        macdCross: "bullish",
        return63: 0.3,
        vol252: 0.45,
        volSample: 252,
        mddHorizon: -0.1,
        revenueGrowth: 0.2,
        earningsGrowth: 0.2,
        operatingMargin: 0.2,
        debtToEquity: 0.2,
        trailingPE: 15,
        roe: 0.2,
        fundamentalsAvailable: true,
      }),
      "3m",
    );

    assert.equal(result.reports.technical.assessment, "bullish");
    assert.equal(result.reports.fundamental.assessment, "bullish");
    assert.equal(result.reports.risk.riskLevel, "high");
    assert.equal(result.reports.risk.assessment, "neutral");
    assert.equal(result.committee.assessment, "neutral");
    assert.ok(result.committee.rawScore && result.committee.rawScore > 0);
    assert.equal(result.committee.finalScore, 0);
    assert.equal(result.committee.weights.some((weight) => weight.agent === "Risk"), false);
    assert.match(result.committee.capNote ?? "", /capped a positive directional score at neutral/);
  });
});
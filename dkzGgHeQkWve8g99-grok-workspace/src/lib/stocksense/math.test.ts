import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { annualizedVol, historicalVar, maxDrawdown, pctChange, rsiWilder, sampleStd, sma } from "./math.ts";

describe("market calculations", () => {
  it("computes rolling means and sample volatility", () => {
    assert.equal(sma([1, 2, 3, 4], 2), 3.5);
    assert.equal(sampleStd([1, 2, 3]), 1);
    assert.equal(sampleStd([1]), null);
  });

  it("annualizes daily sample volatility using 252 sessions", () => {
    const expected = Math.sqrt(0.0002 * 252);
    assert.ok(Math.abs((annualizedVol([0.01, -0.01]) ?? 0) - expected) < 1e-12);
  });

  it("measures peak-to-trough drawdown and horizon returns", () => {
    assert.ok(Math.abs((maxDrawdown([100, 120, 90, 110, 80]) ?? 0) + 1 / 3) < 1e-12);
    assert.ok(Math.abs((pctChange([100, 110, 120], 2) ?? 0) - 0.2) < 1e-12);
    assert.equal(pctChange([100], 1), null);
  });

  it("uses the documented nearest-rank 5th percentile VaR", () => {
    const returns = [-0.1, -0.05, ...Array.from({ length: 28 }, () => 0)];
    assert.equal(historicalVar(returns), -0.05);
    assert.equal(historicalVar(returns.slice(0, 29)), null);
  });

  it("returns the upper RSI bound for a consistently rising series", () => {
    assert.equal(rsiWilder(Array.from({ length: 15 }, (_, index) => index + 1)), 100);
  });
});
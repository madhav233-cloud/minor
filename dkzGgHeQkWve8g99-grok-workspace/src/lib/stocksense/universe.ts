export interface WatchName {
  symbol: string;
  label: string;
  market: string;
}

export const WATCHLIST: WatchName[] = [
  { symbol: "RELIANCE.NS", label: "Reliance", market: "NSE" },
  { symbol: "TCS.NS", label: "TCS", market: "NSE" },
  { symbol: "HDFCBANK.NS", label: "HDFC Bank", market: "NSE" },
  { symbol: "INFY.NS", label: "Infosys", market: "NSE" },
  { symbol: "ITC.NS", label: "ITC", market: "NSE" },
  { symbol: "SBIN.NS", label: "SBI", market: "NSE" },
  { symbol: "AAPL", label: "Apple", market: "US" },
  { symbol: "MSFT", label: "Microsoft", market: "US" },
  { symbol: "NVDA", label: "NVIDIA", market: "US" },
];

export const METHOD_NOTES = [
  "RSI, MACD, moving averages, ATR, volatility, drawdown, and historical VaR are computed in this app from daily prices. The language model never calculates them.",
  "RSI and ATR use Wilder smoothing. MACD is the 12/26 exponential moving-average difference with a 9-period signal. Annualized volatility is the sample standard deviation of daily returns, times the square root of 252.",
  "Historical VaR is the 5th percentile of daily returns (nearest rank) over the last year of sessions, or all available sessions if that is shorter. It is not a promise about future losses.",
  "The chair is not a vote. Each directional analyst contributes a signal between −1 and +1, weighted by the horizon you pick. High measured risk can cap a bullish result at neutral. Missing data is left out. It is not treated as bearish.",
  "A weighted signal at or above +0.22 is bullish. At or below −0.22 it is bearish. Between those values the stance is neutral. One mildly positive analyst cannot outvote two quiet ones just by holding a label.",
  "Headline tone is a lexicon over titles, not a reading of the article and not a forecast. The market may already have priced the story.",
  "The drift band restates average past daily returns over the horizon. It is not a trained price model, and it does not set the technical stance.",
];

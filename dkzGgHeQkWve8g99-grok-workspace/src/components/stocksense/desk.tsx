import { LineChart, Newspaper, Scale, Shield } from "lucide-react";
import { Panel } from "@/components/stocksense/bits";
import { PriceChart } from "@/components/stocksense/price-chart";
import { money, pct, prettyDate, stanceLabel } from "@/lib/stocksense/format";
import { useDesk } from "@/lib/stocksense/store";
import { HORIZON_META } from "@/lib/stocksense/types";
import { WATCHLIST } from "@/lib/stocksense/universe";

const ROLES = [
  { icon: LineChart, title: "Technical", copy: "Trend, momentum, and volume from daily prices." },
  { icon: Newspaper, title: "News", copy: "Events in recent headlines, with the lexicon shown." },
  { icon: Scale, title: "Fundamental", copy: "Growth, margins, leverage, and valuation." },
  { icon: Shield, title: "Risk", copy: "Volatility, drawdown, and historical VaR. Not a vote." },
];

export function Desk({ onRun }: { onRun: (query: string) => void }) {
  const query = useDesk((s) => s.query);
  const setQuery = useDesk((s) => s.setQuery);
  const horizon = useDesk((s) => s.horizon);
  const setHorizon = useDesk((s) => s.setHorizon);
  const phase = useDesk((s) => s.phase);
  const current = useDesk((s) => s.current);
  const error = useDesk((s) => s.error);
  const busy = phase !== "idle";
  const staleHorizon = current != null && current.horizon !== horizon;

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-3xl">
        <p className="font-display text-3xl text-ink md:text-4xl">Convene the committee.</p>
        <p className="mt-3 max-w-2xl text-muted">
          Four analysts read the same company from different evidence. The chair compares them, including where
          they conflict, and writes one assessment. It is decision support, not a price prediction.
        </p>
      </div>

      <Panel>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onRun(query);
          }}
        >
          <label className="text-sm font-medium text-ink" htmlFor="company">
            Company or ticker
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="company"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reliance Industries or AAPL"
              className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 text-ink outline-none"
              autoComplete="off"
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={busy}
              className="press h-11 rounded-lg bg-accent px-4 font-semibold text-accent-ink disabled:opacity-60"
            >
              {busy ? "Working" : "Convene committee"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Investment horizon">
            {(Object.keys(HORIZON_META) as (keyof typeof HORIZON_META)[]).map((key) => {
              const active = horizon === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setHorizon(key)}
                  className={
                    active
                      ? "h-11 rounded-lg bg-panel-2 px-3 text-sm font-medium text-ink"
                      : "h-11 rounded-lg px-3 text-sm text-muted"
                  }
                >
                  {HORIZON_META[key].label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-faint">{HORIZON_META[horizon].blurb}</p>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {WATCHLIST.map((name) => (
            <button
              key={name.symbol}
              type="button"
              disabled={busy}
              onClick={() => {
                setQuery(name.symbol);
                onRun(name.symbol);
              }}
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink disabled:opacity-60"
            >
              {name.label}
              <span className="ml-2 text-faint">{name.market}</span>
            </button>
          ))}
        </div>
      </Panel>

      {error ? (
        <p role="alert" className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-bear">
          {error}
        </p>
      ) : null}

      {phase === "collect" ? (
        <Panel>
          <p className="font-medium">Fetching prices, statements, and headlines.</p>
          <p className="mt-2 text-sm text-muted">
            Indicators, ratios, and risk statistics are calculated in this same step. Nothing on the next screen is
            a placeholder number.
          </p>
        </Panel>
      ) : null}

      {current ? (
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">
                {current.company.exchange} · {current.company.symbol}
              </p>
              <h2 className="font-display text-2xl">{current.company.name}</h2>
              <p className="mt-1 font-mono text-xl tabular-nums">
                {money(current.pack.last, current.company.currency)}
                <span className={current.pack.dayChange != null && current.pack.dayChange < 0 ? "ml-2 text-sm text-bear" : "ml-2 text-sm text-bull"}>
                  {pct(current.pack.dayChange)} session
                </span>
              </p>
            </div>
            <p className="text-sm text-muted">
              {stanceLabel(current.committee.assessment)} on {HORIZON_META[current.horizon].label.toLowerCase()}
              <span className="block text-faint">Prices through {prettyDate(current.pack.priceAsOf)}</span>
            </p>
          </div>
          <PriceChart series={current.series} currency={current.company.currency} />
          {staleHorizon ? (
            <p className="mt-3 text-sm text-caution">
              The horizon on screen is {HORIZON_META[horizon].label.toLowerCase()}, but this report used{" "}
              {HORIZON_META[current.horizon].label.toLowerCase()}. Convene again to reassess.
            </p>
          ) : null}
        </Panel>
      ) : phase === "idle" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
            <Panel key={role.title} className="rounded-3xl">
              <Icon className="size-5 text-accent" aria-hidden />
              <h2 className="mt-3 text-lg font-semibold">{role.title}</h2>
              <p className="mt-1 text-sm text-muted">{role.copy}</p>
            </Panel>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

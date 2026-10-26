import { useEffect } from "react";
import { Archive, FlaskConical, LayoutDashboard, Library, Scale } from "lucide-react";
import { Archive as ArchiveView } from "@/components/stocksense/archive";
import { Committee } from "@/components/stocksense/committee";
import { Desk } from "@/components/stocksense/desk";
import { Evidence } from "@/components/stocksense/evidence";
import { Lab } from "@/components/stocksense/lab";
import { gatherCompany, narrateCompany } from "@/lib/stocksense/analyze.functions";
import { useDesk, type ViewId } from "@/lib/stocksense/store";

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "desk", label: "Desk", icon: LayoutDashboard },
  { id: "committee", label: "Committee", icon: Scale },
  { id: "evidence", label: "Evidence", icon: Library },
  { id: "lab", label: "Lab", icon: FlaskConical },
  { id: "archive", label: "Archive", icon: Archive },
];

export function AppShell() {
  const view = useDesk((s) => s.view);
  const setView = useDesk((s) => s.setView);
  const hydrate = useDesk((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function onRun(query: string) {
    const desk = useDesk.getState();
    if (desk.phase !== "idle") return;
    const trimmed = query.trim();
    if (!trimmed) {
      desk.setError("Enter a company name or ticker.");
      return;
    }
    desk.setError(null);
    desk.setPhase("collect");
    desk.setView("desk");
    try {
      const gathered = await gatherCompany({ data: { query: trimmed, horizon: desk.horizon } });
      if (!gathered.ok) {
        desk.setError(gathered.error);
        return;
      }
      desk.setCurrent(gathered.bundle);
      desk.setView("committee");
      desk.setPhase("narrate");
      const narrated = await narrateCompany({ data: { bundle: gathered.bundle } });
      if (narrated.ok) desk.applyProse(narrated.prose, narrated.note);
    } catch (err) {
      desk.setError(err instanceof Error ? err.message : "The committee could not be convened.");
    } finally {
      useDesk.getState().setPhase("idle");
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-display text-2xl tracking-tight">StockSense</h1>
            <p className="text-sm text-muted">Investment committee</p>
          </div>
          <p className="max-w-48 text-right text-xs text-faint">Educational. Not a solicitation or a forecast.</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3" aria-label="Sections">
          {NAV.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setView(item.id)}
                className={
                  active
                    ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-panel-2 px-3 text-sm font-medium text-ink"
                    : "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm text-muted"
                }
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "desk" ? <Desk onRun={onRun} /> : null}
        {view === "committee" ? <Committee /> : null}
        {view === "evidence" ? <Evidence /> : null}
        {view === "lab" ? <Lab /> : null}
        {view === "archive" ? <ArchiveView /> : null}
        <footer className="mt-8 max-w-3xl text-xs text-faint">
          Prices and annual statements come from Yahoo Finance. Headlines come from Google News. Indicators are
          computed in StockSense. Model wording, when present, is constrained to that pack and does not replace the
          tables. This is not investment advice.
        </footer>
      </main>
    </div>
  );
}

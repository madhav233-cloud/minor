import { create } from "zustand";
import type { AgentId, AnalysisBundle, Horizon, ModelProse, ScenarioInput } from "./types";
import { NEUTRAL_SCENARIO } from "./types";

export type ViewId = "desk" | "committee" | "evidence" | "lab" | "archive";
export type Phase = "idle" | "collect" | "narrate";

const ARCHIVE_KEY = "stocksense.archive.v1";

interface DeskState {
  view: ViewId;
  horizon: Horizon;
  query: string;
  phase: Phase;
  error: string | null;
  current: AnalysisBundle | null;
  archive: AnalysisBundle[];
  hydrated: boolean;
  scenario: ScenarioInput;
  proseMode: "model" | "rules";
  evidenceAgent: AgentId | "all";
  challenge: string;
  setView: (view: ViewId) => void;
  setHorizon: (horizon: Horizon) => void;
  setQuery: (query: string) => void;
  setPhase: (phase: Phase) => void;
  setError: (error: string | null) => void;
  setCurrent: (bundle: AnalysisBundle | null) => void;
  applyProse: (prose: ModelProse | null, note: string | null) => void;
  setProseMode: (mode: "model" | "rules") => void;
  setEvidenceAgent: (agent: AgentId | "all") => void;
  setScenario: (scenario: ScenarioInput) => void;
  setChallenge: (challenge: string) => void;
  hydrate: () => void;
  openArchive: (id: string) => void;
}

function readArchive(): AnalysisBundle[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AnalysisBundle[]).slice(0, 12) : [];
  } catch {
    return [];
  }
}

function writeArchive(items: AnalysisBundle[]) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items.slice(0, 12)));
}

export const useDesk = create<DeskState>((set, get) => ({
  view: "desk",
  horizon: "3m",
  query: "Reliance Industries",
  phase: "idle",
  error: null,
  current: null,
  archive: [],
  hydrated: false,
  scenario: NEUTRAL_SCENARIO,
  proseMode: "model",
  evidenceAgent: "all",
  challenge: "",
  setView: (view) => set({ view }),
  setHorizon: (horizon) => set({ horizon }),
  setQuery: (query) => set({ query }),
  setPhase: (phase) => set({ phase }),
  setError: (error) => set({ error }),
  setCurrent: (bundle) => {
    if (!bundle) {
      set({ current: null });
      return;
    }
    const archive = [bundle, ...get().archive.filter((item) => item.id !== bundle.id)].slice(0, 12);
    if (get().hydrated) writeArchive(archive);
    set({ current: bundle, archive, scenario: NEUTRAL_SCENARIO, error: null });
  },
  applyProse: (prose, note) => {
    const current = get().current;
    if (!current) return;
    const next = { ...current, modelProse: prose, modelNote: note };
    const archive = get().archive.map((item) => (item.id === next.id ? next : item));
    if (get().hydrated) writeArchive(archive);
    set({ current: next, archive });
  },
  setProseMode: (proseMode) => set({ proseMode }),
  setEvidenceAgent: (evidenceAgent) => set({ evidenceAgent, view: "evidence" }),
  setScenario: (scenario) => set({ scenario }),
  setChallenge: (challenge) => set({ challenge }),
  hydrate: () => set({ archive: readArchive(), hydrated: true }),
  openArchive: (id) => {
    const item = get().archive.find((row) => row.id === id);
    if (!item) return;
    set({
      current: item,
      horizon: item.horizon,
      query: item.company.symbol,
      view: "committee",
      scenario: NEUTRAL_SCENARIO,
      error: null,
    });
  },
}));

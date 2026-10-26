import { stanceLabel } from "./format";
import { HORIZON_META, type AgentId, type AnalysisBundle, type ModelProse } from "./types";

function bag(): Map<string, ModelProse> {
  const g = globalThis as unknown as { __ssNarr?: Map<string, ModelProse> };
  if (!g.__ssNarr) g.__ssNarr = new Map();
  return g.__ssNarr;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

function brief(bundle: AnalysisBundle): string {
  const lines: string[] = [];
  const co = bundle.company;
  lines.push(
    `Company: ${co.name} (${co.symbol}), exchange ${co.exchange}, currency ${co.currency}, sector ${co.sector ?? "unknown"}.`,
  );
  lines.push(`Horizon: ${HORIZON_META[bundle.horizon].label}. ${HORIZON_META[bundle.horizon].blurb}`);
  lines.push(
    `FIXED committee assessment: ${bundle.committee.assessment}. FIXED risk: ${bundle.committee.riskLevel}. Do not change these.`,
  );
  lines.push(
    `Scores: raw ${bundle.committee.rawScore ?? "n/a"}, final ${bundle.committee.finalScore ?? "n/a"}. ${bundle.committee.capNote ?? "No risk cap."}`,
  );
  for (const key of ["technical", "news", "fundamental", "risk"] as const) {
    const r = bundle.reports[key];
    lines.push(
      `AGENT ${r.title} fixed_assessment=${r.assessment} risk=${r.riskLevel ?? "n/a"} as_of=${r.dataAsOf ?? "unknown"}`,
    );
    lines.push(`Rule summary: ${r.summary}`);
    for (const e of r.evidence.slice(0, 6)) lines.push(`Evidence (${e.pole}): ${e.claim} | source: ${e.source}`);
    for (const m of r.metrics) lines.push(`Metric ${m.label}: ${m.value}`);
    for (const l of r.limitations) lines.push(`Limitation: ${l}`);
  }
  lines.push(`Constructive: ${bundle.committee.supporting.join(" || ") || "none"}`);
  lines.push(`Caution: ${bundle.committee.opposing.join(" || ") || "none"}`);
  lines.push(
    `Disagreements: ${bundle.committee.disagreements.map((d) => `${d.title}: ${d.detail}`).join(" || ")}`,
  );
  lines.push(`Missing: ${bundle.committee.missing.join(" || ") || "none"}`);
  lines.push(`Data warnings: ${bundle.pack.warnings.join(" || ") || "none"}`);
  return lines.join("\n").slice(0, 14_000);
}

function clean(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length < 40 || t.length > 900) return null;
  if (/guaranteed return|you should buy|you should sell|not financial advice i am/i.test(t)) return null;
  return t;
}

function cleanList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.replace(/\s+/g, " ").trim())
    .filter((x) => x.length >= 20 && x.length <= 240)
    .slice(0, 4);
  return items.length >= 2 ? items : null;
}

const SYSTEM = `You write prose for StockSense, an educational investment committee. You do not calculate, invent, or correct figures. You do not give buy, sell, or hold instructions, price targets, or personalized advice. Assessments in the brief are fixed. Explain only the evidence, conflicts, and gaps you are given. Plain sentences. No markdown. Return JSON with string keys technical, news, fundamental, risk, committee (each under 80 words) and changeConditions (array of 3 short strings). Mention the fixed stance in each agent paragraph using these words only as given: ${["bullish", "neutral", "bearish", "insufficient"].join(", ")}.`;

export async function writeNarrative(
  bundle: AnalysisBundle,
): Promise<{ prose: ModelProse | null; note: string | null }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { prose: null, note: "The language model is not available here. The rule synthesis is the assessment." };
  }
  const text = brief(bundle);
  const key = hash(text);
  const hit = bag().get(key);
  if (hit) return { prose: hit, note: null };

  const body = {
    model: "grok-4.5",
    temperature: 0.2,
    max_tokens: 900,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Rewrite the explanations. Keep every fixed assessment. If a number is not in the brief, do not introduce it.\n\n${text}`,
      },
    ],
  };

  let res: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(28_000),
    });
    if (res.ok) break;
    if (![429, 500, 502, 503].includes(res.status) || attempt === 1) break;
  }
  if (!res || !res.ok) {
    console.error("narrate status", res?.status ?? "none");
    return {
      prose: null,
      note: "The language model did not respond, so the wording stays with the rule synthesis. The stance was already set by the calculations.",
    };
  }
  const payload = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  const raw =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) => {
              if (typeof part === "string") return part;
              const rec = part as { text?: string };
              return rec?.text ?? "";
            })
            .join("")
        : "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as Record<string, unknown>;
  } catch {
    return { prose: null, note: "The language model returned unreadable wording. The rule synthesis stands." };
  }
  const prose: ModelProse = {
    technical: clean(parsed.technical),
    news: clean(parsed.news),
    fundamental: clean(parsed.fundamental),
    risk: clean(parsed.risk),
    committee: clean(parsed.committee),
    changeConditions: cleanList(parsed.changeConditions),
  };
  const keys: (keyof ModelProse)[] = ["technical", "news", "fundamental", "risk", "committee"];
  const kept = keys.filter((k) => typeof prose[k] === "string").length;
  if (kept < 3) {
    return { prose: null, note: "The language model wording failed the length checks. The rule synthesis stands." };
  }
  for (const agent of ["technical", "news", "fundamental"] as const) {
    const paragraph = prose[agent];
    const assessment = bundle.reports[agent as AgentId].assessment;
    if (paragraph && assessment !== "insufficient_data" && !paragraph.toLowerCase().includes(assessment)) {
      prose[agent] = `${stanceLabel(assessment)} remains the ${agent} stance. ${paragraph}`;
    }
  }
  bag().set(key, prose);
  if (bag().size > 40) {
    const first = bag().keys().next().value;
    if (first) bag().delete(first);
  }
  return { prose, note: null };
}

import { createServerFn } from "@tanstack/react-start";
import type { AnalysisBundle, Horizon } from "./types";

function readRequest(input: unknown): { query: string; horizon: Horizon } {
  if (!input || typeof input !== "object") throw new Error("Missing request.");
  const query = String((input as { query?: unknown }).query ?? "").trim();
  const h = (input as { horizon?: unknown }).horizon;
  const horizon: Horizon = h === "1m" || h === "3m" || h === "12m" ? h : "3m";
  if (query.length < 1 || query.length > 80) throw new Error("Enter a company name or ticker.");
  return { query, horizon };
}

export const gatherCompany = createServerFn({ method: "POST" })
  .validator(readRequest)
  .handler(async ({ data }) => {
    const { buildBundle } = await import("./market.server");
    try {
      const bundle = await buildBundle(data.query, data.horizon);
      return { ok: true as const, bundle };
    } catch (err) {
      const message = err instanceof Error ? err.message : "The committee could not be convened.";
      return { ok: false as const, error: message };
    }
  });

export const narrateCompany = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Missing brief.");
    const bundle = (input as { bundle?: AnalysisBundle }).bundle;
    if (!bundle?.company?.symbol || !bundle.reports?.technical || !bundle.committee) {
      throw new Error("The evidence pack was incomplete.");
    }
    return { bundle };
  })
  .handler(async ({ data }) => {
    const { writeNarrative } = await import("./narrate.server");
    try {
      return { ok: true as const, ...(await writeNarrative(data.bundle)) };
    } catch (err) {
      console.error("narrate threw", err instanceof Error ? err.message : err);
      return {
        ok: true as const,
        prose: null,
        note: "The language model step failed. The calculated assessment is unchanged.",
      };
    }
  });

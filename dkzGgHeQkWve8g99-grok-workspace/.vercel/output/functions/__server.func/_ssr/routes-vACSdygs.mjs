import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as money, c as prettyDate, d as stanceLabel, l as riskLabel, n as NEUTRAL_SCENARIO, o as num, r as STANCE_THRESHOLD, s as pct, t as HORIZON_META, u as scenarioActive } from "./types-9wxUdtPy.mjs";
import { r as judge, t as applyScenario } from "./assess-Dv4Zk1eQ.mjs";
import { a as Library, c as ChartLine, i as Newspaper, l as ArrowUpRight, n as Shield, o as LayoutDashboard, r as Scale, s as FlaskConical, u as Archive } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as ResponsiveContainer, i as Area, n as YAxis, o as Tooltip, r as XAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-vACSdygs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-3xl border border-line bg-panel p-4 md:p-5", className),
		children
	});
}
function StancePill({ stance }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("pill", stance === "bullish" ? "pill-bull" : stance === "bearish" ? "pill-bear" : stance === "neutral" ? "pill-neutral" : "pill-caution"),
		children: stanceLabel(stance)
	});
}
function RiskPill({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("pill", level === "low" ? "pill-bull" : level === "moderate" || level === "insufficient_data" ? "pill-neutral" : level === "elevated" ? "pill-caution" : "pill-bear"),
		children: ["Risk ", riskLabel(level)]
	});
}
function proseFor(report, bundle, mode) {
	if (mode === "model" && bundle.modelProse) {
		const text = bundle.modelProse[report.agent];
		if (text) return text;
	}
	return report.summary;
}
function committeeProse(bundle, mode) {
	if (mode === "model" && bundle.modelProse?.committee) return bundle.modelProse.committee;
	return bundle.committee.summary;
}
function changeLines(bundle, mode) {
	if (mode === "model" && bundle.modelProse?.changeConditions?.length) return bundle.modelProse.changeConditions;
	return bundle.committee.changeConditions;
}
var AGENT_ORDER = [
	"technical",
	"news",
	"fundamental",
	"risk"
];
var ARCHIVE_KEY = "stocksense.archive.v1";
function readArchive() {
	try {
		const raw = localStorage.getItem(ARCHIVE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
	} catch {
		return [];
	}
}
function writeArchive(items) {
	localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items.slice(0, 12)));
}
var useDesk = create((set, get) => ({
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
		set({
			current: bundle,
			archive,
			scenario: NEUTRAL_SCENARIO,
			error: null
		});
	},
	applyProse: (prose, note) => {
		const current = get().current;
		if (!current) return;
		const next = {
			...current,
			modelProse: prose,
			modelNote: note
		};
		const archive = get().archive.map((item) => item.id === next.id ? next : item);
		if (get().hydrated) writeArchive(archive);
		set({
			current: next,
			archive
		});
	},
	setProseMode: (proseMode) => set({ proseMode }),
	setEvidenceAgent: (evidenceAgent) => set({
		evidenceAgent,
		view: "evidence"
	}),
	setScenario: (scenario) => set({ scenario }),
	setChallenge: (challenge) => set({ challenge }),
	hydrate: () => set({
		archive: readArchive(),
		hydrated: true
	}),
	openArchive: (id) => {
		const item = get().archive.find((row) => row.id === id);
		if (!item) return;
		set({
			current: item,
			horizon: item.horizon,
			query: item.company.symbol,
			view: "committee",
			scenario: NEUTRAL_SCENARIO,
			error: null
		});
	}
}));
function Archive$1() {
	const archive = useDesk((s) => s.archive);
	const hydrated = useDesk((s) => s.hydrated);
	const openArchive = useDesk((s) => s.openArchive);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Opening saved runs on this device."
	}) });
	if (archive.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-2xl",
		children: "No saved runs."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-muted",
		children: "Each committee you convene is kept in this browser, with the stance and the time it was produced. Nothing is sent to an account."
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl",
			children: "Archive"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Earlier runs stay as they were. A later price does not rewrite them."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-3",
			children: archive.map((item, index) => {
				const prior = archive.slice(index + 1).find((row) => row.company.symbol === item.company.symbol);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								prettyDate(item.generatedAt),
								" · ",
								HORIZON_META[item.horizon].label
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-lg font-semibold",
							children: [item.company.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 font-mono text-sm text-faint",
								children: item.company.symbol
							})]
						}),
						prior ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Previous saved run was ",
								prior.committee.assessment,
								" on ",
								prettyDate(prior.generatedAt),
								"."
							]
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StancePill, { stance: item.committee.assessment }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: item.committee.riskLevel })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 h-11 text-sm text-accent",
					onClick: () => openArchive(item.id),
					children: "Open this run"
				})] }, item.id);
			})
		})]
	});
}
function answerFromEvidence(bundle, question) {
	const q = question.toLowerCase();
	const c = bundle.committee;
	const horizon = HORIZON_META[bundle.horizon].label.toLowerCase();
	const weights = c.weights.map((w) => `${w.agent} ${Math.round(w.weight * 100)}% (signal ${num(w.signal, 2)}, ${stanceLabel(w.stance).toLowerCase()})`).join(", ");
	if (/vote|majority|three|count the|outweigh/.test(q)) return `The chair does not count votes. On a ${horizon} horizon the renormalized weights are ${weights || "unavailable"}. A bullish or bearish label needs a weighted score beyond ±${STANCE_THRESHOLD.toFixed(2)}. ${c.rawScore == null ? "There was not enough directional evidence to score." : `The directional score was ${num(c.rawScore, 2)}${c.finalScore != null && c.rawScore !== c.finalScore ? `, and after the risk rule it was ${num(c.finalScore, 2)}` : ""}.`} ${c.capNote ?? "No risk cap changed the result."}`;
	if (/risk|volatil|drawdown|var|downside/.test(q)) {
		const r = bundle.reports.risk;
		return `${r.summary} The grade is a constraint on the chair, not a fourth vote. ${r.evidence.slice(0, 3).map((e) => e.claim).join(" ")}`;
	}
	if (/missing|gap|unverified|disagree|inconsistent|why not|insufficient/.test(q)) {
		const gaps = c.missing.slice(0, 4);
		return gaps.length ? `What this run could not use: ${gaps.join(" ")} Missing inputs were not filled with a negative assumption.` : "No data gap was flagged on this run. That does not mean the sources are complete, only that the checks in this app did not fire.";
	}
	if (/flip|change|would|alter|what if|trigger/.test(q)) return `The conclusion would be revisited if: ${c.changeConditions.join(" ")} Those are conditions, not predictions.`;
	if (/news|headline|sentiment|regulat/.test(q)) return `${bundle.reports.news.summary} ${bundle.reports.news.evidence.slice(0, 3).map((e) => e.claim).join(" ")}`;
	if (/valuat|p\/e|multiple|expensive|cheap|fundamental|earnings|revenue|margin/.test(q)) return `${bundle.reports.fundamental.summary} ${bundle.reports.fundamental.limitations[0] ?? ""}`;
	if (/lstm|forecast|predict|target|price will|drift/.test(q)) {
		const d = bundle.pack;
		return d.drift == null ? "This run does not include a price forecast. The older LSTM model is not connected here, and no target price is produced." : `The only forward-looking number is a historical-drift baseline of ${pct(d.drift)} over ${HORIZON_META[bundle.horizon].days} sessions, with a one-standard-deviation band of ${pct(d.driftLow)} to ${pct(d.driftHigh)}. It restates average past returns from ${d.driftSample} sessions. It is not a trained model and it does not set the stance.`;
	}
	const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
	const ranked = [
		...Object.values(bundle.reports).flatMap((r) => r.evidence.map((e) => e.claim)),
		...c.supporting,
		...c.opposing,
		...c.disagreements.map((d) => d.detail)
	].map((claim) => ({
		claim,
		score: words.reduce((n, w) => n + (claim.toLowerCase().includes(w) ? 1 : 0), 0)
	})).filter((row) => row.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
	if (ranked.length === 0) return `Nothing in this run answers that directly. The chair's assessment is ${stanceLabel(c.assessment).toLowerCase()} on a ${horizon} horizon. ${c.summary}`;
	return `From this run's evidence: ${ranked.map((r) => r.claim).join(" ")}`;
}
var PROMPTS = [
	"Why is this not a vote?",
	"What evidence is missing?",
	"What would change the conclusion?",
	"How is risk used?",
	"Is there a price forecast?"
];
function Committee() {
	const current = useDesk((s) => s.current);
	const phase = useDesk((s) => s.phase);
	const mode = useDesk((s) => s.proseMode);
	const setMode = useDesk((s) => s.setProseMode);
	const setEvidenceAgent = useDesk((s) => s.setEvidenceAgent);
	const challenge = useDesk((s) => s.challenge);
	const setChallenge = useDesk((s) => s.setChallenge);
	const [answer, setAnswer] = (0, import_react.useState)(null);
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-2xl",
		children: "No committee is in session."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-muted",
		children: "Convene one from the desk. This screen does not keep a sample report."
	})] });
	const usingModel = mode === "model" && !!current.modelProse?.committee;
	const conditions = changeLines(current, mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "border-t-2 border-t-accent",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: ["Investment committee · ", current.company.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-4xl text-ink md:text-5xl",
							children: stanceLabel(current.committee.assessment)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: current.committee.riskLevel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pill pill-neutral",
								children: HORIZON_META[current.horizon].label
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-3xl text-ink",
						children: committeeProse(current, mode)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-sm text-muted tabular-nums",
						children: [current.committee.finalScore == null ? "No weighted score" : `Score ${num(current.committee.finalScore, 2)} · threshold ±${STANCE_THRESHOLD.toFixed(2)}`, current.committee.rawScore != null && current.committee.finalScore != null && current.committee.rawScore !== current.committee.finalScore ? ` · before cap ${num(current.committee.rawScore, 2)}` : ""]
					}),
					current.committee.capNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-caution",
						children: current.committee.capNote
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [current.committee.weights.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "pill pill-neutral",
							children: [
								row.agent,
								" ",
								Math.round(row.weight * 100),
								"% · ",
								num(row.signal, 2)
							]
						}, row.agent)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pill pill-neutral",
							children: "Risk is a constraint, not a weight"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-faint",
							children: usingModel ? "Model wording, checked against the evidence pack." : "Rule synthesis. Figures in the tables are the record."
						}), current.modelProse ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 rounded-lg border border-line px-3",
							onClick: () => setMode(mode === "model" ? "rules" : "model"),
							children: mode === "model" ? "Show rule synthesis" : "Show model wording"
						}) : null]
					}),
					current.modelNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: current.modelNote
					}) : null,
					phase === "narrate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-accent",
						children: "Writing the explanation from this evidence pack."
					}) : null
				]
			}),
			current.pack.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold uppercase tracking-wide text-muted",
				children: "Data quality"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2 text-sm",
				children: current.pack.warnings.map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: warning }, warning))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Constructive evidence"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-3 text-sm text-muted",
					children: [current.committee.supporting.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "None of the scored evidence pointed this way." }) : null, current.committee.supporting.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Reasons for caution"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-3 text-sm text-muted",
					children: [current.committee.opposing.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "None of the scored evidence pointed this way." }) : null, current.committee.opposing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Where the analysts split"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-col gap-4",
				children: current.committee.disagreements.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: item.detail
				})] }, item.title))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: AGENT_ORDER.map((id) => {
					const report = current.reports[id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: report.title
							}), id === "risk" && report.riskLevel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: report.riskLevel }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StancePill, { stance: report.assessment })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: proseFor(report, current, mode)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm",
							children: report.metrics.slice(0, 6).map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-faint",
									children: metric.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate font-mono tabular-nums",
									children: metric.value
								})]
							}, metric.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-4 h-11 text-sm text-accent",
							onClick: () => setEvidenceAgent(id),
							children: "Inspect evidence"
						})
					] }, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "What would change this"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted",
						children: conditions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-faint",
						children: usingModel && current.modelProse?.changeConditions ? "These conditions were phrased by the model from the rule list." : "These conditions come from the rule layer."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "Challenge the conclusion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Answers are assembled from this run. They do not call the model again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: PROMPTS.map((prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 rounded-lg border border-line px-3 text-sm",
							onClick: () => {
								setChallenge(prompt);
								setAnswer(answerFromEvidence(current, prompt));
							},
							children: prompt
						}, prompt))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							setAnswer(answerFromEvidence(current, challenge));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: challenge,
							onChange: (event) => setChallenge(event.target.value),
							placeholder: "Ask about this run",
							className: "h-11 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "press h-11 rounded-lg bg-panel-2 px-4 font-medium",
							children: "Answer from evidence"
						})]
					}),
					answer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: answer
					}) : null
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-faint",
				children: [
					"Run ",
					prettyDate(current.generatedAt),
					" · ",
					current.company.symbol,
					" · prices through",
					" ",
					prettyDate(current.pack.priceAsOf),
					" · statements ",
					prettyDate(current.pack.statementAsOf)
				]
			})
		]
	});
}
function PriceChart({ series, currency }) {
	if (series.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Price history was not available for a chart."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: series,
				margin: {
					top: 8,
					right: 0,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "d",
						hide: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						hide: true,
						domain: ["auto", "auto"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						formatter: (value) => [money(typeof value === "number" ? value : Number(value), currency), "Close"],
						labelFormatter: (label) => String(label),
						contentStyle: {
							background: "var(--color-panel)",
							border: "1px solid var(--color-line)",
							borderRadius: 12,
							color: "var(--color-ink)"
						},
						labelStyle: { color: "var(--color-muted)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "c",
						stroke: "var(--color-accent)",
						fill: "var(--color-accent)",
						fillOpacity: .16,
						strokeWidth: 1.75,
						dot: false,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
var WATCHLIST = [
	{
		symbol: "RELIANCE.NS",
		label: "Reliance",
		market: "NSE"
	},
	{
		symbol: "TCS.NS",
		label: "TCS",
		market: "NSE"
	},
	{
		symbol: "HDFCBANK.NS",
		label: "HDFC Bank",
		market: "NSE"
	},
	{
		symbol: "INFY.NS",
		label: "Infosys",
		market: "NSE"
	},
	{
		symbol: "ITC.NS",
		label: "ITC",
		market: "NSE"
	},
	{
		symbol: "SBIN.NS",
		label: "SBI",
		market: "NSE"
	},
	{
		symbol: "AAPL",
		label: "Apple",
		market: "US"
	},
	{
		symbol: "MSFT",
		label: "Microsoft",
		market: "US"
	},
	{
		symbol: "NVDA",
		label: "NVIDIA",
		market: "US"
	}
];
var METHOD_NOTES = [
	"RSI, MACD, moving averages, ATR, volatility, drawdown, and historical VaR are computed in this app from daily prices. The language model never calculates them.",
	"RSI and ATR use Wilder smoothing. MACD is the 12/26 exponential moving-average difference with a 9-period signal. Annualized volatility is the sample standard deviation of daily returns, times the square root of 252.",
	"Historical VaR is the 5th percentile of daily returns (nearest rank) over the last year of sessions, or all available sessions if that is shorter. It is not a promise about future losses.",
	"The chair is not a vote. Each directional analyst contributes a signal between −1 and +1, weighted by the horizon you pick. High measured risk can cap a bullish result at neutral. Missing data is left out. It is not treated as bearish.",
	"A weighted signal at or above +0.22 is bullish. At or below −0.22 it is bearish. Between those values the stance is neutral. One mildly positive analyst cannot outvote two quiet ones just by holding a label.",
	"Headline tone is a lexicon over titles, not a reading of the article and not a forecast. The market may already have priced the story.",
	"The drift band restates average past daily returns over the horizon. It is not a trained price model, and it does not set the technical stance."
];
var ROLES = [
	{
		icon: ChartLine,
		title: "Technical",
		copy: "Trend, momentum, and volume from daily prices."
	},
	{
		icon: Newspaper,
		title: "News",
		copy: "Events in recent headlines, with the lexicon shown."
	},
	{
		icon: Scale,
		title: "Fundamental",
		copy: "Growth, margins, leverage, and valuation."
	},
	{
		icon: Shield,
		title: "Risk",
		copy: "Volatility, drawdown, and historical VaR. Not a vote."
	}
];
function Desk({ onRun }) {
	const query = useDesk((s) => s.query);
	const setQuery = useDesk((s) => s.setQuery);
	const horizon = useDesk((s) => s.horizon);
	const setHorizon = useDesk((s) => s.setHorizon);
	const phase = useDesk((s) => s.phase);
	const current = useDesk((s) => s.current);
	const error = useDesk((s) => s.error);
	const busy = phase !== "idle";
	const staleHorizon = current != null && current.horizon !== horizon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl text-ink md:text-4xl",
					children: "Convene the committee."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-muted",
					children: "Four analysts read the same company from different evidence. The chair compares them, including where they conflict, and writes one assessment. It is decision support, not a price prediction."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					onRun(query);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-sm font-medium text-ink",
						htmlFor: "company",
						children: "Company or ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "company",
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Reliance Industries or AAPL",
							className: "h-11 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 text-ink outline-none",
							autoComplete: "off",
							suppressHydrationWarning: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "press h-11 rounded-lg bg-accent px-4 font-semibold text-accent-ink disabled:opacity-60",
							children: busy ? "Working" : "Convene committee"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Investment horizon",
						children: Object.keys(HORIZON_META).map((key) => {
							const active = horizon === key;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": active,
								onClick: () => setHorizon(key),
								className: active ? "h-11 rounded-lg bg-panel-2 px-3 text-sm font-medium text-ink" : "h-11 rounded-lg px-3 text-sm text-muted",
								children: HORIZON_META[key].label
							}, key);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-faint",
						children: HORIZON_META[horizon].blurb
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: WATCHLIST.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						setQuery(name.symbol);
						onRun(name.symbol);
					},
					className: "h-11 rounded-lg border border-line px-3 text-sm text-ink disabled:opacity-60",
					children: [name.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-faint",
						children: name.market
					})]
				}, name.symbol))
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-bear",
				children: error
			}) : null,
			phase === "collect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Fetching prices, statements, and headlines."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Indicators, ratios, and risk statistics are calculated in this same step. Nothing on the next screen is a placeholder number."
			})] }) : null,
			current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								current.company.exchange,
								" · ",
								current.company.symbol
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: current.company.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xl tabular-nums",
							children: [money(current.pack.last, current.company.currency), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: current.pack.dayChange != null && current.pack.dayChange < 0 ? "ml-2 text-sm text-bear" : "ml-2 text-sm text-bull",
								children: [pct(current.pack.dayChange), " session"]
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							stanceLabel(current.committee.assessment),
							" on ",
							HORIZON_META[current.horizon].label.toLowerCase(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-faint",
								children: ["Prices through ", prettyDate(current.pack.priceAsOf)]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
					series: current.series,
					currency: current.company.currency
				}),
				staleHorizon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-caution",
					children: [
						"The horizon on screen is ",
						HORIZON_META[horizon].label.toLowerCase(),
						", but this report used",
						" ",
						HORIZON_META[current.horizon].label.toLowerCase(),
						". Convene again to reassess."
					]
				}) : null
			] }) : phase === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: ROLES.map((role) => {
					const Icon = role.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "rounded-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5 text-accent",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg font-semibold",
								children: role.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: role.copy
							})
						]
					}, role.title);
				})
			}) : null
		]
	});
}
function Evidence() {
	const current = useDesk((s) => s.current);
	const filter = useDesk((s) => s.evidenceAgent);
	const setFilter = useDesk((s) => s.setEvidenceAgent);
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-2xl",
		children: "No evidence pack yet."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-muted",
		children: "Run a company from the desk to trace each claim back to a calculation or a headline."
	})] });
	const agents = ["all", ...AGENT_ORDER];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Evidence"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-muted",
				children: "Every claim below was produced with the calculated metrics or a retrieved headline. The model, when it writes, is not allowed to replace these rows."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: agents.map((agent) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": filter === agent,
					onClick: () => setFilter(agent),
					className: filter === agent ? "h-11 rounded-lg bg-panel-2 px-3 text-sm font-medium" : "h-11 rounded-lg px-3 text-sm text-muted",
					children: agent === "all" ? "All" : current.reports[agent].title.replace(" analyst", "")
				}, agent))
			}),
			AGENT_ORDER.filter((id) => filter === "all" || filter === id).map((id) => {
				const report = current.reports[id];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold",
							children: report.title
						}), id === "risk" && report.riskLevel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: report.riskLevel }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StancePill, { stance: report.assessment })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-faint",
						children: ["As of ", prettyDate(report.dataAsOf)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3",
						children: report.metrics.map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 rounded-lg bg-panel-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-faint",
								children: metric.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 truncate font-mono text-sm tabular-nums",
								children: metric.value
							})]
						}, metric.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-4",
						children: report.evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-t border-line pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: item.claim
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-faint",
									children: [
										item.pole === "support" ? "Constructive" : item.pole === "caution" ? "Caution" : "Context",
										" · ",
										item.source,
										item.observedAt ? ` · ${prettyDate(item.observedAt)}` : ""
									]
								}),
								item.sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: item.sourceUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "mt-1 inline-flex h-11 items-center gap-1 text-sm text-accent",
									children: ["Open source", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
										className: "size-4",
										"aria-hidden": true
									})]
								}) : null
							]
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "h-11 text-sm text-muted",
							children: "Limitations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex list-disc flex-col gap-2 pl-5 text-sm text-muted",
							children: report.limitations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
						})]
					})
				] }, id);
			}),
			filter === "all" || filter === "news" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Headlines retrieved"
			}), current.pack.headlines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "No headlines were stored for this run."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-3",
				children: current.pack.headlines.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-faint",
							children: [
								item.publisher,
								" · ",
								prettyDate(item.publishedAt),
								" · lexicon ",
								item.sentiment.toFixed(2),
								item.events.length ? ` · ${item.events.join(", ")}` : ""
							]
						}),
						item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-sm text-accent",
							children: "Open headline"
						}) : null
					]
				}, item.title))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "How a number gets into the report"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted",
				children: METHOD_NOTES.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))
			})] })
		]
	});
}
function Lab() {
	const current = useDesk((s) => s.current);
	const scenario = useDesk((s) => s.scenario);
	const setScenario = useDesk((s) => s.setScenario);
	const result = (0, import_react.useMemo)(() => {
		if (!current) return null;
		const active = scenarioActive(scenario);
		const applied = applyScenario(current.pack, active ? scenario : NEUTRAL_SCENARIO);
		return {
			...judge(applied.pack, current.horizon, active),
			notes: applied.notes,
			active
		};
	}, [current, scenario]);
	if (!current || !result) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-2xl",
		children: "The lab needs a real run."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-muted",
		children: "Stress tests start from observed metrics. They are not available until a committee has been convened."
	})] });
	const growthDisabled = current.pack.revenueGrowth == null;
	const volDisabled = current.pack.vol252 == null;
	const newsDisabled = current.pack.newsScore == null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "What-if lab"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "These sliders are assumptions. They do not change the stored report, and they are not a forecast. Technical evidence stays on the observed prices. Only growth, volatility, and the headline score move."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Observed assessment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StancePill, { stance: current.committee.assessment }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: current.committee.riskLevel })]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: result.active ? "Stressed assessment" : "No shock applied"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StancePill, { stance: result.committee.assessment }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPill, { level: result.committee.riskLevel })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: result.active ? `Observed was ${stanceLabel(current.committee.assessment).toLowerCase()}. Stressed is ${stanceLabel(result.committee.assessment).toLowerCase()}.` : "Move a slider to separate a stress test from the observed run."
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Revenue-growth shock" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular-nums",
									children: [
										scenario.revenueGrowthDelta > 0 ? "+" : "",
										Math.round(scenario.revenueGrowthDelta * 100),
										" pp"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -20,
								max: 20,
								step: 1,
								disabled: growthDisabled,
								value: Math.round(scenario.revenueGrowthDelta * 100),
								onChange: (event) => setScenario({
									...scenario,
									revenueGrowthDelta: Number(event.target.value) / 100
								}),
								className: "mt-2 h-11 w-full accent-accent disabled:opacity-40"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-faint",
								children: growthDisabled ? "Disabled. Observed revenue growth was missing or set aside." : `Observed growth ${pct(current.pack.revenueGrowth)} becomes ${pct((current.pack.revenueGrowth ?? 0) + scenario.revenueGrowthDelta)}.`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Volatility multiple" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular-nums",
									children: [num(scenario.volMultiplier, 1), "×"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 70,
								max: 160,
								step: 5,
								disabled: volDisabled,
								value: Math.round(scenario.volMultiplier * 100),
								onChange: (event) => setScenario({
									...scenario,
									volMultiplier: Number(event.target.value) / 100
								}),
								className: "mt-2 h-11 w-full"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-faint",
								children: volDisabled ? "Disabled. Observed volatility was missing." : `Observed ${pct(current.pack.vol252)} becomes ${pct((current.pack.vol252 ?? 0) * scenario.volMultiplier)}. Drawdown and VaR stay observed.`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Headline-score shift" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular-nums",
									children: [scenario.newsShift > 0 ? "+" : "", num(scenario.newsShift, 1)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -40,
								max: 40,
								step: 5,
								disabled: newsDisabled,
								value: Math.round(scenario.newsShift * 100),
								onChange: (event) => setScenario({
									...scenario,
									newsShift: Number(event.target.value) / 100
								}),
								className: "mt-2 h-11 w-full"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-faint",
								children: newsDisabled ? "Disabled. There was no lexicon score." : "Shifts the score only. The headlines themselves do not change."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 self-start rounded-lg border border-line px-3 text-sm",
						onClick: () => setScenario(NEUTRAL_SCENARIO),
						children: "Reset assumptions"
					})
				]
			}) }),
			result.notes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "What the stress test changed"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted",
				children: result.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Stressed chair"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: result.committee.summary
			})] })
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function readRequest(input) {
	if (!input || typeof input !== "object") throw new Error("Missing request.");
	const query = String(input.query ?? "").trim();
	const h = input.horizon;
	const horizon = h === "1m" || h === "3m" || h === "12m" ? h : "3m";
	if (query.length < 1 || query.length > 80) throw new Error("Enter a company name or ticker.");
	return {
		query,
		horizon
	};
}
var gatherCompany = createServerFn({ method: "POST" }).validator(readRequest).handler(createSsrRpc("1ea92a6b7b1c085ad49d4d601791706c3a07e62469768beef3476ec758a7837f"));
var narrateCompany = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Missing brief.");
	const bundle = input.bundle;
	if (!bundle?.company?.symbol || !bundle.reports?.technical || !bundle.committee) throw new Error("The evidence pack was incomplete.");
	return { bundle };
}).handler(createSsrRpc("2486d83f32504e970d356ea1dfeb056a2999d591c0ce15689f9ead4e2e73296b"));
var NAV = [
	{
		id: "desk",
		label: "Desk",
		icon: LayoutDashboard
	},
	{
		id: "committee",
		label: "Committee",
		icon: Scale
	},
	{
		id: "evidence",
		label: "Evidence",
		icon: Library
	},
	{
		id: "lab",
		label: "Lab",
		icon: FlaskConical
	},
	{
		id: "archive",
		label: "Archive",
		icon: Archive
	}
];
function AppShell() {
	const view = useDesk((s) => s.view);
	const setView = useDesk((s) => s.setView);
	const hydrate = useDesk((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	async function onRun(query) {
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
			const gathered = await gatherCompany({ data: {
				query: trimmed,
				horizon: desk.horizon
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-canvas text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-line",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl tracking-tight",
					children: "StockSense"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Investment committee"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-48 text-right text-xs text-faint",
					children: "Educational. Not a solicitation or a forecast."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3",
				"aria-label": "Sections",
				children: NAV.map((item) => {
					const active = view === item.id;
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-current": active ? "page" : void 0,
						onClick: () => setView(item.id),
						className: active ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-panel-2 px-3 text-sm font-medium text-ink" : "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							"aria-hidden": true
						}), item.label]
					}, item.id);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 py-6",
			children: [
				view === "desk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, { onRun }) : null,
				view === "committee" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Committee, {}) : null,
				view === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Evidence, {}) : null,
				view === "lab" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lab, {}) : null,
				view === "archive" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive$1, {}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "mt-8 max-w-3xl text-xs text-faint",
					children: "Prices and annual statements come from Yahoo Finance. Headlines come from Google News. Indicators are computed in StockSense. Model wording, when present, is constrained to that pack and does not replace the tables. This is not investment advice."
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };

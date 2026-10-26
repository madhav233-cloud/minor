import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze.functions-D_yKhpvd.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var gatherCompany_createServerFn_handler = createServerRpc({
	id: "1ea92a6b7b1c085ad49d4d601791706c3a07e62469768beef3476ec758a7837f",
	name: "gatherCompany",
	filename: "src/lib/stocksense/analyze.functions.ts"
}, (opts) => gatherCompany.__executeServer(opts));
var gatherCompany = createServerFn({ method: "POST" }).validator(readRequest).handler(gatherCompany_createServerFn_handler, async ({ data }) => {
	const { buildBundle } = await import("./market.server-BuIudSxX.mjs");
	try {
		return {
			ok: true,
			bundle: await buildBundle(data.query, data.horizon)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "The committee could not be convened."
		};
	}
});
var narrateCompany_createServerFn_handler = createServerRpc({
	id: "2486d83f32504e970d356ea1dfeb056a2999d591c0ce15689f9ead4e2e73296b",
	name: "narrateCompany",
	filename: "src/lib/stocksense/analyze.functions.ts"
}, (opts) => narrateCompany.__executeServer(opts));
var narrateCompany = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Missing brief.");
	const bundle = input.bundle;
	if (!bundle?.company?.symbol || !bundle.reports?.technical || !bundle.committee) throw new Error("The evidence pack was incomplete.");
	return { bundle };
}).handler(narrateCompany_createServerFn_handler, async ({ data }) => {
	const { writeNarrative } = await import("./narrate.server-COEf3z2e.mjs");
	try {
		return {
			ok: true,
			...await writeNarrative(data.bundle)
		};
	} catch (err) {
		console.error("narrate threw", err instanceof Error ? err.message : err);
		return {
			ok: true,
			prose: null,
			note: "The language model step failed. The calculated assessment is unchanged."
		};
	}
});
//#endregion
export { gatherCompany_createServerFn_handler, narrateCompany_createServerFn_handler };

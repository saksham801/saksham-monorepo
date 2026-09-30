import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "blogs",
		compatibilityDate: "2026-09-18",
		compatibilityFlags: [
			"global_fetch_strictly_public",
		],
		entrypoint: "@astrojs/cloudflare/entrypoints/server",
		workersDev: false,
		previewUrls: false,
		observability: {
			enabled: true,
			traces: {
				enabled: true,
			},
		},
		domains: [
			"demo2.sakshampy.in",
			"blogs.sakshampy.in",
		],
		env: {
			TURBO_TEAM: bindings.text("saksham-dubeys-projects"),
			TURBO_TEAMID: bindings.text("team_xf3FXzFrtsA27OX9SDyzR5AC"),
			ASSETS: bindings.assets(),
		},
	},
});

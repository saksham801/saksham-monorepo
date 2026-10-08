import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "docs",
		compatibilityDate: "2026-09-15",
		compatibilityFlags: [
			"global_fetch_strictly_public",
		],
		entrypoint: "@astrojs/cloudflare/entrypoints/server",
		workersDev: false,
		previewUrls: false,
		cache: {
			enabled: true,
		},
		observability: {
			logs: {
				enabled: true,
				invocationLogs: true,
			},
			traces: {
				enabled: true,
			},
		},
		env: {
			ASSETS: bindings.assets(),
		},
	},
});

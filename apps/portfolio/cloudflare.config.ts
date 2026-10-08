import { bindings, defineConfig } from "cf/config";

/**
 * Secret-like files were detected but not read or migrated: .dev.vars.example. Only `secrets.required` entries are migrated.
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default defineConfig({
	worker: {
		name: "saksham",
		compatibilityDate: "2026-09-11",
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

import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "report",
		compatibilityDate: "2026-09-25",
		compatibilityFlags: [
			"global_fetch_strictly_public",
		],
		entrypoint: "@astrojs/cloudflare/entrypoints/server",
		observability: {
			enabled: true,
		},
		env: {
			ASSETS: bindings.assets(),
		},
	},
});

import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/.wrangler/**",
      "**/node_modules/**",
      "**/worker-configuration.d.ts",
      "**/src/content/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);

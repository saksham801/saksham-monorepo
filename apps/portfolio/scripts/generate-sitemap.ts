import { readdir, writeFile } from "node:fs/promises";
import { extname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = new URL("../../../", import.meta.url);
const blogContent = new URL("apps/blogs/src/content/blog/", repoRoot);
const docsContent = new URL("apps/docs/src/content/docs/", repoRoot);
const output = new URL("../public/sitemap.xml", import.meta.url);

async function contentPaths(
	directory: URL,
	rootDirectory: URL = directory,
	excluded: Set<string> = new Set(),
): Promise<string[]> {
	const paths: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
		if (entry.isDirectory()) {
			paths.push(...(await contentPaths(path, rootDirectory, excluded)));
			continue;
		}
		if (![".md", ".mdx"].includes(extname(entry.name))) continue;
		const route = relative(fileURLToPath(rootDirectory), fileURLToPath(path)).split(sep).join("/");
		const page = route.slice(0, -extname(route).length);
		if (excluded.has(page)) continue;
		paths.push(page === "index" ? "" : page.replace(/\/index$/, ""));
	}
	return paths;
}

const blogPosts = await contentPaths(blogContent);
const documentation = await contentPaths(docsContent, docsContent, new Set(["404"]));
const paths = [
	"/",
	"/terms/",
	"/blogs/",
	"/blogs/about/",
	"/blogs/terms/",
	...blogPosts.map((path) => `/blogs/${path}/`),
	"/docs/",
	...documentation.flatMap((path) => (path ? [`/docs/${path}/`] : [])),
];
const uniquePaths = [...new Set(paths)].sort();
const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");
const escapeXml = (value: string) =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const urls = uniquePaths
	.map((path) => `  <url><loc>https://sakshampy.in${escapeXml(encodePath(path))}</loc></url>`)
	.join("\n");

await writeFile(
	output,
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

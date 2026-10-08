export const CANONICAL_ORIGIN = "https://sakshampy.in";

export function canonicalUrl(path: string): string {
  const pathname = new URL(path, CANONICAL_ORIGIN).pathname;
  return new URL(pathname, CANONICAL_ORIGIN).href;
}

export function serializeStructuredData(
  data: Record<string, unknown> | Record<string, unknown>[],
): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

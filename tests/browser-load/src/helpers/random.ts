export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state + 0x6D2B79F5) >>> 0; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const choose = <T>(items: T[], rand: () => number): T => items[Math.floor(rand() * items.length)]!;
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

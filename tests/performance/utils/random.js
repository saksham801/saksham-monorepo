import { randomSeed, sleep } from 'k6';

randomSeed(Number(__ENV.SEED || 12345) + (__VU || 0));
export const integer = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const choose = (items) => items[integer(0, items.length - 1)];
export const pause = (minSeconds, maxSeconds) => sleep(integer(minSeconds, maxSeconds));

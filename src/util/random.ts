import {source} from 'grapevine';
import {aleaRandom, Random} from 'gs-tools/export/random';

export const $random = source<Random<number>>(() => aleaRandom());

export const $randomSeed = source<() => number>(() => () => Math.random());
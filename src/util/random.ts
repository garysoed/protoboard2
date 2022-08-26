import {source} from 'grapevine';
import {aleaRandom, Random} from 'gs-tools/export/random2';

export const $random = source<Random<number>>(() => aleaRandom());

export const $randomSeed = source<() => number>(() => () => Math.random());
import {source} from 'grapevine';
import {Random, aleaSeed, fromSeed} from 'gs-tools/export/random';

export const $random = source<Random>(() => fromSeed(aleaSeed('')));

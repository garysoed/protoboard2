import { Random, aleaSeed, fromSeed } from 'gs-tools/export/random';
import { source } from 'grapevine';

export const $random = source<Random>('random', () => fromSeed(aleaSeed('')));

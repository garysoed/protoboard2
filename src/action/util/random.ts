import { source } from 'grapevine';
import { aleaSeed, fromSeed, Random } from 'gs-tools/export/random';

export const $random = source<Random<unknown>>('random', () => fromSeed(aleaSeed('')));

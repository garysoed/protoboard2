import { source } from 'grapevine';
import { aleaSeed, fromSeed, Random } from 'gs-tools/export/random';
import { BehaviorSubject } from 'rxjs';

export const $random = source(
    () => new BehaviorSubject<Random<unknown>>(fromSeed(aleaSeed(''))),
    globalThis,
);

import { source } from 'grapevine';
import { aleaSeed, fromSeed } from 'gs-tools/export/random';
import { BehaviorSubject } from 'rxjs';

export const $random = source(
    () => new BehaviorSubject(fromSeed(aleaSeed(''))),
    globalThis,
);

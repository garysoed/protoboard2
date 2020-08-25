import { stream } from 'grapevine';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SavedState } from '../../src/state/saved-state';

import { $generateObjectId } from './generate-object-id';


export class StagingService {
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #states$ = new BehaviorSubject<ReadonlySet<SavedState>>(new Set());

  constructor(private readonly generateObjectIdFn: () => string) { }

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  get states$(): Observable<ReadonlySet<SavedState>> {
    return this.#states$;
  }

  addState(objectType: string, payload: Record<string, unknown>): void {
    const state = {type: objectType, id: this.generateObjectIdFn(), payload};
    const states = this.#states$.getValue();
    this.#states$.next(new Set([...states, state]));
  }

  setStaging(staging: boolean): void {
    if (!staging) {
      this.#states$.next(new Set());
    }
    this.#isStaging$.next(staging);
  }
}

export const $stagingService = stream(
    vine => $generateObjectId.get(vine).pipe(
        map(generateObjectIdFn => {
          const service = new StagingService(generateObjectIdFn);
          (service as any).id = Date.now();
          return service;
        }),
    ),
    globalThis,
);

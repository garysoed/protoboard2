import { source, Vine } from 'grapevine';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE } from '../../src/region/supply';
import { SavedState } from '../../src/state/saved-state';
import { $stateService, setStates } from '../../src/state/state-service';


export const ROOT_SLOT_PREFIX = 'pbd.root-slot';
export const ROOT_SLOT_TYPE = 'pbd.root-slot';

export class StagingService {
  private readonly idGenerator = new SimpleIdGenerator();
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #states$ = new BehaviorSubject<ReadonlySet<SavedState>>(new Set());

  constructor(private readonly vine: Vine) { }

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  get states$(): Observable<ReadonlySet<SavedState>> {
    return this.#states$;
  }

  addState(objectType: string, payload: Record<string, unknown>): Observable<unknown> {
    return $stateService.get(this.vine).pipe(
        tap(stateService => {
          const id = this.idGenerator.generate(stateService.objectIds);
          const state = {type: objectType, id, payload};
          const states = this.#states$.getValue();
          this.#states$.next(new Set([...states, state]));
        }),
    );
  }

  setStaging(staging: boolean): void {
    if (!staging) {
      this.#states$.next(new Set());
      const rootSlots = [];
      for (let i = 0; i < 9; i++) {
        rootSlots.push({
          id: `${ROOT_SLOT_PREFIX}${i}`,
          type: ROOT_SLOT_TYPE,
          payload: {contentIds: []},
        });
      }

      setStates(
          new Set([
            ...rootSlots,
            {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {contentIds: []}},
            {id: SUPPLY_ID, type: SUPPLY_TYPE, payload: {contentIds: []}},
          ]),
          this.vine,
      );
    }
    this.#isStaging$.next(staging);
  }
}

export const $stagingService = source(vine => new StagingService(vine));

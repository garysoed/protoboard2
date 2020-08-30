import { stream, Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { BehaviorSubject, defer, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { SavedState } from '../../src/state/saved-state';
import { $stateService } from '../../src/state/state-service';

import { $saveService, SaveService } from './save-service';


export class StagingService {
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #states$ = new BehaviorSubject<ReadonlySet<SavedState<object>>>(new Set());
  private readonly idGenerator = new SimpleIdGenerator();

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  @cache()
  get states$(): Observable<ReadonlySet<SavedState<object>>> {
    return this.#states$;
  }

  constructor(
      private readonly saveService: SaveService,
      private readonly vine: Vine,
  ) { }

  addState(objectType: string, payload: Record<string, unknown>): Observable<unknown> {
    return $stateService.get(this.vine).pipe(
        switchMap(stateService => stateService.objectIds$),
        tap(objectIds => {
          const id = this.idGenerator.generate(objectIds);
          const state = {type: objectType, id, payload};
          const states = this.#states$.getValue();
          this.#states$.next(new Set([...states, state]));
        }),
        take(1),
    );
  }

  clear(): void {
    this.#states$.next(new Set());
  }


  setStaging(staging: boolean): void {
    this.#isStaging$.next(staging);
    this.saveService.setSaving(!staging);
  }
}

export const $stagingService = stream(
    'StagingService',
    vine => $saveService.get(vine)
        .pipe(
            map(saveService => new StagingService(saveService, vine)),
        ),
    globalThis,
);

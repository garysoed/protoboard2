import { source, stream, Vine } from 'grapevine';
import { $asMap, $filterNonNull, $map, $pipe, $recordToMap } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $stateHandlers, OnCreateFn } from './register-state-handler';
import { SavedState } from './saved-state';
import { State } from './state';


const $statesRaw = source<readonly SavedState[]>(() => []);

export class StateService {
  constructor(
      private readonly stateHandlers: ReadonlyMap<string, OnCreateFn>,
      private readonly statesRaw: readonly SavedState[]) { }

  getObject(id: string): Observable<Node>|null {
    return this.objectsMap.get(id) || null;
  }

  @cache()
  private get objectsMap(): ReadonlyMap<string, Observable<Node>> {
    return $pipe(
        this.statesMap,
        $map(([id, state]) => {
          const handler = this.stateHandlers.get(id);
          if (!handler) {
            return null;
          }

          return [id, handler(state)] as [string, Observable<Node>];
        }),
        $filterNonNull(),
        $asMap(),
    );
  }

  @cache()
  private get statesMap(): ReadonlyMap<string, State> {
    const statesMap = new Map<string, State>();
    for (const state of this.statesRaw) {
      const runtimePayload = $pipe(
          state.payload,
          $recordToMap(),
          $map(([key, value]) => {
            return [key, new BehaviorSubject(value)] as [string, BehaviorSubject<unknown>];
          }),
          $asMap(),
      );
      statesMap.set(
          state.id,
          {
            ...state,
            payload: runtimePayload,
          });
    }

    return statesMap;
  }
}

export const $stateService = stream(
    vine => {
      return combineLatest([
        $statesRaw.get(vine),
        $stateHandlers.get(vine),
      ])
      .pipe(map(([states, handlers]) => new StateService(handlers, states)));
    },
    globalThis,
);


export function setState(states: readonly SavedState[], vine: Vine): void {
  $statesRaw.set(vine, () => states);
}

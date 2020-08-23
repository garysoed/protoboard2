import { source, stream, Vine } from 'grapevine';
import { $asMap, $filterNonNull, $map, $pipe, $recordToMap } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $stateHandlers, OnCreateFn } from './register-state-handler';
import { SavedState } from './saved-state';
import { State } from './state';


const $statesRaw = source<readonly SavedState[]>(() => []);

class ObjectCache {
  private object: Observable<Node>|null = null;

  constructor(
      private readonly fn: OnCreateFn,
      private readonly state: State,
  ) { }

  getOrCreate(context: PersonaContext): Observable<Node> {
    if (this.object) {
      return this.object;
    }

    const object = this.fn(this.state, context);
    this.object = object;
    return object;
  }
}

export class StateService {
  constructor(
      private readonly stateHandlers: ReadonlyMap<string, OnCreateFn>,
      private readonly statesRaw: readonly SavedState[]) { }

  getObject(id: string, context: PersonaContext): Observable<Node>|null {
    const cache = this.objectCachesMap.get(id);
    if (!cache) {
      return null;
    }

    return cache.getOrCreate(context);
  }

  @cache()
  private get objectCachesMap(): ReadonlyMap<string, ObjectCache> {
    return $pipe(
        this.statesMap,
        $map(([id, state]) => {
          const handler = this.stateHandlers.get(state.type);
          if (!handler) {
            return null;
          }

          return [id, new ObjectCache(handler, state)] as [string, ObjectCache];
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


export function addObject(state: SavedState, vine: Vine): void {
  $statesRaw.set(vine, states => [...states, state]);
}

export function clearObjects(vine: Vine): void {
  $statesRaw.set(vine, () => []);
}

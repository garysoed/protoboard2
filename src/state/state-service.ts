import { source, stream, Vine } from 'grapevine';
import { $asArray, $asMap, $asRecord, $asSet, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { $stateHandlers, OnCreateFn } from './register-state-handler';
import { SavedState } from './saved-state';
import { State } from './state';


const $statesRaw = source<ReadonlyMap<string, SavedState>>(() => new Map());

class ObjectCache {
  private object: Observable<Node>|null = null;

  constructor(
      private readonly fn: OnCreateFn<object>,
      private readonly state: State<object>,
  ) { }

  getOrCreate(context: PersonaContext): Observable<Node> {
    if (this.object) {
      return this.object;
    }

    const object = this.fn(this.state, context).pipe(shareReplay({bufferSize: 1, refCount: true}));
    this.object = object;
    return object;
  }
}

export class StateService {
  constructor(
      private readonly stateHandlers: ReadonlyMap<string, OnCreateFn<object>>,
      private readonly statesRaw: ReadonlyMap<string, SavedState>,
  ) { }

  @cache()
  get currentState$(): Observable<ReadonlyMap<string, SavedState>> {
    const states$List = $pipe(
        this.statesMap,
        $map(([key, state]) => {
          const payloads$ = resolveMap(state.payload);
          return payloads$.pipe(
              map(payload => {
                return [key, {...state, payload}] as [string, SavedState];
              }),
          );
        }),
        $asArray(),
    );

    if (states$List.length <= 0) {
      return observableOf(new Map());
    }

    return combineLatest(states$List).pipe(map(pairs => new Map(pairs)));
  }

  getObject(id: string, context: PersonaContext): Observable<Node>|null {
    const cache = this.objectCachesMap.get(id);
    if (!cache) {
      return null;
    }

    return cache.getOrCreate(context);
  }

  getState<P extends object>(id: string): State<P>|null {
    return this.statesMap.get(id) as State<P> || null;
  }

  @cache()
  get objectIds(): ReadonlySet<string> {
    return $pipe(this.objectCachesMap, $map(([id]) => id), $asSet());
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
  private get statesMap(): ReadonlyMap<string, State<object>> {
    const statesMap = new Map<string, State<object>>();
    for (const [, state] of this.statesRaw) {
      const runtimePayload: Record<string, BehaviorSubject<unknown>> = {};

      for (const key in state.payload) {
        if (!state.payload.hasOwnProperty(key)) {
          continue;
        }

        runtimePayload[key] = new BehaviorSubject(state.payload[key]);
      }
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
      .pipe(
          map(([states, handlers]) => new StateService(handlers, states)),
          shareReplay({refCount: true, bufferSize: 1}),
      );
    },
    globalThis,
);

export function setStates(
    states: readonly SavedState[],
    vine: Vine,
): void {
  const statesMap = $pipe(
      states,
      $map(state => [state.id, state] as [string, SavedState]),
      $asMap(),
  );
  $statesRaw.set(vine, () => statesMap);
}

function resolveMap(
    subjectObject: object,
): Observable<Record<string, unknown>> {
  const payloads$List: Array<Observable<[string, unknown]>> = [];
  for (const key in subjectObject) {
    if (!subjectObject.hasOwnProperty(key)) {
      continue;
    }

    const subject = (subjectObject as any)[key];
    if (!(subject instanceof BehaviorSubject)) {
      continue;
    }

    payloads$List.push(subject.pipe(map(value => [key, value])));
  }

  if (payloads$List.length <= 0) {
    return observableOf({});
  }

  return combineLatest(payloads$List).pipe(
      map(pairs => $pipe(pairs, $asRecord())),
  );
}

import { source, Vine } from 'grapevine';
import { $asArray, $asMap, $asRecord, $asSet, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { SavedState } from './saved-state';
import { State } from './state';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type StateHandler<P extends object> =
    (state: State<P>, context: PersonaContext) => Observable<Node>;


class ObjectCache {
  private object: Observable<Node>|null = null;

  constructor(
      private readonly fn: StateHandler<object>,
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
  protected readonly statesRaw$ = new BehaviorSubject<ReadonlySet<SavedState<object>>>(new Set());

  constructor(private readonly vine: Vine) { }

  @cache()
  get currentState$(): Observable<ReadonlyMap<string, SavedState<object>>> {
    return this.statesMap$.pipe(
        switchMap(statesMap => {
          const states$List = $pipe(
              statesMap,
              $map(([key, state]) => {
                const payloads$ = resolveMap(state.payload);
                return payloads$.pipe(
                    map(payload => {
                      return [key, {...state, payload}] as [string, SavedState<object>];
                    }),
                );
              }),
              $asArray(),
          );

          if (states$List.length <= 0) {
            return observableOf(new Map());
          }

          return combineLatest(states$List).pipe(map(pairs => new Map(pairs)));
        }),
    );
  }

  getObject(id: string, context: PersonaContext): Observable<Node|null> {
    return this.objectCachesMap$.pipe(
        switchMap(objectCachesMap => {
          const cache = objectCachesMap.get(id);
          if (!cache) {
            return observableOf(null);
          }

          return cache.getOrCreate(context);
        }),
    );
  }

  getState<P extends object>(id: string): Observable<State<P>|null> {
    return this.statesMap$.pipe(map(statesMap => statesMap.get(id) as State<P> || null));
  }

  setStates(statesRaw: ReadonlySet<SavedState<object>>): void {
    this.statesRaw$.next(statesRaw);
  }

  @cache()
  get objectIds$(): Observable<ReadonlySet<string>> {
    return this.objectCachesMap$.pipe(
        map(objectCachesMap => $pipe(objectCachesMap, $map(([id]) => id), $asSet())),
    );
  }

  @cache()
  private get objectCachesMap$(): Observable<ReadonlyMap<string, ObjectCache>> {
    return combineLatest([$stateHandlers.get(this.vine), this.statesMap$]).pipe(
        map(([stateHandlers, statesMap]) => {
          return $pipe(
              statesMap,
              $map(([id, state]) => {
                const handler = stateHandlers.get(state.type);
                if (!handler) {
                  return null;
                }

                return [id, new ObjectCache(handler, state)] as [string, ObjectCache];
              }),
              $filterNonNull(),
              $asMap(),
          );
        }),
        shareReplay({bufferSize: 1, refCount: true}),
    );
  }

  @cache()
  private get statesMap$(): Observable<ReadonlyMap<string, State<object>>> {
    return this.statesRaw$.pipe(
        map(statesRaw => {
          const statesMap = new Map<string, State<object>>();
          for (const state of statesRaw) {
            const runtimePayload: Record<string, BehaviorSubject<unknown>> = {};

            for (const key in state.payload) {
              if (!state.payload.hasOwnProperty(key)) {
                continue;
              }

              runtimePayload[key] = new BehaviorSubject((state.payload as any)[key]);
              (runtimePayload[key] as any).id = Date.now();
            }
            statesMap.set(
                state.id,
                {
                  ...state,
                  payload: runtimePayload,
                });
          }

          return statesMap;
        }),
        shareReplay({bufferSize: 1, refCount: true}),
    );
  }
}

export const $stateHandlers = source(() => new Map<string, StateHandler<object>>());
export function registerStateHandler<P extends object>(
    type: string,
    handler: StateHandler<P>,
    vine: Vine,
): void {
  $stateHandlers.set(
      vine,
      existingHandlers => new Map([
        ...existingHandlers,
        [type, handler as StateHandler<object>],
      ]),
  );
}

export const $stateService = source(vine => new StateService(vine));

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

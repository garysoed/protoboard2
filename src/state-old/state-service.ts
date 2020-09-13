import { source } from 'grapevine';
import { $asArray, $asRecord, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { SavedState } from './saved-state';
import { State } from './state';


export class StateService {
  protected readonly statesRaw$ = new BehaviorSubject<ReadonlySet<SavedState<object>>>(new Set());

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

  getState<P extends object>(id: string): Observable<State<P>|null> {
    return this.statesMap$.pipe(map(statesMap => statesMap.get(id) as State<P> || null));
  }

  setStates(statesRaw: ReadonlySet<SavedState<object>>): void {
    this.statesRaw$.next(statesRaw);
  }

  @cache()
  get statesMap$(): Observable<ReadonlyMap<string, State<object>>> {
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

export const $stateService = source('StateService', () => new StateService());

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

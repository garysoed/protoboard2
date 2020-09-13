import { source, stream, Vine } from 'grapevine';
import { $asMap, $asSet, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { State } from './state';
import { $stateService, StateHandler, StateService } from './state-service';

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


class RenderableService {
  constructor(
      private readonly stateService: StateService,
      private readonly vine: Vine,
  ) { }

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

  @cache()
  private get objectCachesMap$(): Observable<ReadonlyMap<string, ObjectCache>> {
    return combineLatest([$stateHandlers.get(this.vine), this.stateService.statesMap$]).pipe(
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
  get objectIds$(): Observable<ReadonlySet<string>> {
    return this.objectCachesMap$.pipe(
        map(objectCachesMap => $pipe(objectCachesMap, $map(([id]) => id), $asSet())),
    );
  }
}

export const $renderableService = stream(
    'RenderableService',
    vine => $stateService.get(vine).pipe(
        map(stateService => new RenderableService(stateService, vine)),
    ),
    globalThis,
);

export const $stateHandlers =
    source('stateHandlers', () => new Map<string, StateHandler<object>>());
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

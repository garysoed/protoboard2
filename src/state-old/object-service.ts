import { source, Vine } from 'grapevine';
import { $asMap, $asSet, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { ObjectCreateSpec } from './object-create-spec';
import { ObjectSpec } from './object-spec';
import { $objectSpecMap } from './object-spec-list';


class ObjectCache {
  private object: Observable<Node>|null = null;

  constructor(
      private readonly fn: ObjectCreateSpec<object>,
      private readonly state: ObjectSpec<object>,
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


class ObjectService {
  constructor(private readonly vine: Vine) { }

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
    return combineLatest([$stateHandlers.get(this.vine), $objectSpecMap.get(this.vine)]).pipe(
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

export const $objectService = source('ObjectService', vine => new ObjectService(vine));

export const $stateHandlers =
    source('stateHandlers', () => new Map<string, ObjectCreateSpec<object>>());
export function registerObjectCreateSpec<P extends object>(
    type: string,
    handler: ObjectCreateSpec<P>,
    vine: Vine,
): void {
  $stateHandlers.set(
      vine,
      existingHandlers => new Map([
        ...existingHandlers,
        [type, handler as ObjectCreateSpec<object>],
      ]),
  );
}

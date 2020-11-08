import {Vine, source} from 'grapevine';
import {$asMap, $asSet, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {NodeWithId, PersonaContext} from 'persona';
import {Observable, combineLatest, of as observableOf} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';

import {$objectSpecMap} from './getters/root-state';
import {ObjectCreateSpec} from './object-create-spec';
import {ObjectSpec} from './object-spec';


class ObjectCache {
  private object: Observable<NodeWithId<Element>>|null = null;

  constructor(
      private readonly fn: ObjectCreateSpec<object>,
      readonly state: ObjectSpec<object>,
  ) { }

  getOrCreate(context: PersonaContext): Observable<NodeWithId<Element>> {
    if (this.object) {
      return this.object;
    }

    const object = this.fn(this.state, context).pipe(shareReplay({bufferSize: 1, refCount: true}));
    this.object = object;
    return object;
  }
}


export class ObjectService {
  constructor(private readonly vine: Vine) { }

  getObject(id: string, context: PersonaContext): Observable<NodeWithId<Element>|null> {
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

  getObjectSpec<P>(id: string): Observable<ObjectSpec<P>|null> {
    return this.objectCachesMap$.pipe(
        map(cache => {
          return (cache.get(id)?.state || null) as ObjectSpec<P>|null;
        }),
    );
  }

  @cache()
  private get objectCachesMap$(): Observable<ReadonlyMap<string, ObjectCache>> {
    return combineLatest([$objectSpecMap.get(this.vine), $createSpecMap.get(this.vine)])
        .pipe(
            map(([objectSpecMap, createSpecMap]) => {
              return $pipe(
                  objectSpecMap,
                  $map(([id, state]) => {
                    const handler = createSpecMap.get(state.type);
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

export const $createSpecMap = source<ReadonlyMap<string, ObjectCreateSpec<any>>>(
    'createSpecMap',
    () => new Map(),
);

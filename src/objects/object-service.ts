import {source, stream} from 'grapevine';
import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {NodeWithId, PersonaContext} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

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


export const $createSpecMap = source<ReadonlyMap<string, ObjectCreateSpec<any>>>(
    'createSpecMap',
    () => new Map(),
);

export const $objectNodeCacheMap = stream<ReadonlyMap<string, ObjectCache>>(
    'objectNodeCacheMap',
    vine => combineLatest([$objectSpecMap.get(vine), $createSpecMap.get(vine)])
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
        ),
);

type GetObjectNode = (id: string, context: PersonaContext) => Observable<NodeWithId<Element>|null>;
export const $getObjectNode = stream<GetObjectNode>(
    'getObjectNode',
    vine => $objectNodeCacheMap.get(vine).pipe(
        map(objectNodeCacheMap => {
          return (id: string, context: PersonaContext) => {
            const cache = objectNodeCacheMap.get(id);
            if (!cache) {
              return observableOf(null);
            }

            return cache.getOrCreate(context);
          };
        }),
    ),
);

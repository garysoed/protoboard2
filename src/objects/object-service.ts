import {source, stream} from 'grapevine';
import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {NodeWithId, PersonaContext} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {$getObjectSpec, $objectSpecIds} from './getters/root-state';
import {ObjectCreateSpec} from './object-create-spec';
import {ObjectSpec} from './object-spec';


class ObjectCache {
  private object: Observable<NodeWithId<Element>|null>|null = null;

  constructor(
      private readonly fn: ObjectCreateSpec<object>,
      readonly objectId: StateId<ObjectSpec<object>>,
  ) { }

  getOrCreate(context: PersonaContext): Observable<NodeWithId<Element>|null> {
    if (this.object) {
      return this.object;
    }

    const object = this.fn(this.objectId, context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));
    this.object = object;
    return object;
  }
}

// TODO: Move to RootState
export const $createSpecMap = source<ReadonlyMap<string, ObjectCreateSpec<any>>>(
    'createSpecMap',
    () => new Map(),
);

const $objectNodeCacheMap = stream<ReadonlyMap<string, ObjectCache>>(
    'objectNodeCacheMap',
    vine => combineLatest([
      $objectSpecIds.get(vine),
      $getObjectSpec.get(vine),
      $createSpecMap.get(vine),
    ])
        .pipe(
            map(([objectSpecIds, getObjectSpec, createSpecMap]) => {
              return $pipe(
                  objectSpecIds,
                  $map(id => {
                    const state = getObjectSpec(id);
                    if (!state) {
                      return null;
                    }

                    const handler = createSpecMap.get(state.type);
                    if (!handler) {
                      return null;
                    }

                    return [id.id, new ObjectCache(handler, id)] as const;
                  }),
                  $filterNonNull(),
                  $asMap(),
              );
            }),
            shareReplay({bufferSize: 1, refCount: true}),
        ),
);

type GetObjectNode = (id: StateId<ObjectSpec<any>>, context: PersonaContext) => Observable<NodeWithId<Element>|null>;
export const $getObjectNode = stream<GetObjectNode>(
    'getObjectNode',
    vine => $objectNodeCacheMap.get(vine).pipe(
        map(objectNodeCacheMap => {
          return (id: StateId<ObjectSpec<any>>, context: PersonaContext) => {
            const cache = objectNodeCacheMap.get(id.id);
            if (!cache) {
              return observableOf(null);
            }
            return cache.getOrCreate(context);
          };
        }),
    ),
);

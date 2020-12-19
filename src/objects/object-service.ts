import {stream} from 'grapevine';
import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {NodeWithId, PersonaContext, render} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';

import {$getObjectSpec, $objectSpecIds} from './getters/root-state';
import {$createSpecMap, ObjectCreateSpec} from './object-create-spec';


class ObjectCache {
  private object: Observable<NodeWithId<Node>|null>|null = null;

  constructor(
      private readonly fn: ObjectCreateSpec<ObjectSpec<object>>,
      readonly objectId: StateId<ObjectSpec<object>>,
  ) { }

  getOrCreate(context: PersonaContext): Observable<NodeWithId<Node>|null> {
    if (this.object) {
      return this.object;
    }

    const object = this.fn(this.objectId, context)
        .pipe(
            switchMap(spec => {
              return spec ? render(spec, context) : observableOf(null);
            }),
            shareReplay({bufferSize: 1, refCount: true}),
        );
    this.object = object;
    return object;
  }
}

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

type GetObjectNode = (id: StateId<ObjectSpec<any>>, context: PersonaContext) => Observable<NodeWithId<Node>|null>;
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

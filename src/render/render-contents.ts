import {$stateService, Vine} from 'grapevine';
import {$asArray, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {Decorator, NodeWithId, RenderSpec} from 'persona';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {Indexed} from '../coordinate/indexed';
import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/object-create-spec';
import {CoordinateTypes} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';


export function renderContents(
    parentId: StateId<ContainerSpec<unknown, CoordinateTypes>>,
    vine: Vine,
): Observable<readonly RenderSpec[]> {
  const stateService = $stateService.get(vine);
  const containerSpec$ = stateService.resolve(parentId);

  return containerSpec$
      .pipe(
          switchMap(containerSpec => {
            if (!containerSpec) {
              return of([]);
            }

            return stateService.resolve(containerSpec.payload.$contentSpecs).pipe(
                withLatestFrom($getRenderSpec.get(vine)),
                switchMap(([contentIds, getRenderSpec]) => {
                  const node$list = $pipe(
                      contentIds ?? [],
                      $map(({objectId, coordinate}) => {
                        return getRenderSpec(objectId, vine).pipe(
                            take(1),
                            filterNonNullable(),
                            map(spec => [coordinate, {id: objectId, spec}] as const),
                        );
                      }),
                      $asArray(),
                  );

                  return node$list.length <= 0 ? of([]) : combineLatest(node$list);
                }),
                map(pairs => {
                  switch (containerSpec.payload.containerType) {
                    case 'indexed':
                      return renderIndexed(new Map(pairs));
                  }
                }),
                map(renderSpecs => $pipe(
                    renderSpecs,
                    $map(({id, spec}) => {
                      const decorator: Decorator<NodeWithId<Node>> = () => {
                        $setParent.get(vine)(id, parentId);
                        return EMPTY;
                      };

                      const decorators: Array<Decorator<NodeWithId<any>>> = [decorator];
                      if (spec.decorators) {
                        decorators.push(...spec.decorators);
                      }

                      return {...spec, decorators};
                    }),
                    $asArray(),
                )),
            );
          }),
      );
}

interface RenderSpecWithId {
  readonly id: StateId<unknown>;
  readonly spec: RenderSpec;
}

function renderIndexed(
    contents: ReadonlyMap<Indexed, RenderSpecWithId>,
): readonly RenderSpecWithId[] {
  return $pipe(
      [...contents],
      $sort(withMap(([coordinate]) => coordinate.index, normal())),
      $map(([, node]) => node),
      $asArray(),
  );
}

import {$stateService, Vine} from 'grapevine';
import {$asArray, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {Decorator, NodeWithId, RenderSpec} from 'persona';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {Indexed} from '../coordinate/indexed';
import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/render-object-spec';
import {CoordinateTypes, IsContainer} from '../payload/is-container';


export function renderContents(
    parentId: StateId<IsContainer<CoordinateTypes>>,
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

            return stateService.resolve(containerSpec.$contentSpecs).pipe(
                switchMap(contentIds => {
                  const getRenderSpec = $getRenderSpec.get(vine);
                  const node$list = $pipe(
                      contentIds ?? [],
                      $map(({objectId, coordinate}) => {
                        return getRenderSpec(objectId).pipe(
                            filterNonNullable(),
                            map(spec => [coordinate, {id: objectId, spec}] as const),
                        );
                      }),
                      $asArray(),
                  );

                  return node$list.length <= 0 ? of([]) : combineLatest(node$list);
                }),
                map(pairs => {
                  switch (containerSpec.containerType) {
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

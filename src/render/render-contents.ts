import {Vine} from 'grapevine';
import {$asArray, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {applyDecorators, Decorator, NodeWithId, RenderSpec} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {Indexed} from '../coordinate/indexed';
import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/object-create-spec';
import {CoordinateTypes} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';


export function renderContents(
    parentId: StateId<ContainerSpec<unknown, CoordinateTypes>>,
    vine: Vine,
): Observable<readonly RenderSpec[]> {
  const containerSpec$ = $stateService.get(vine)
      .pipe(switchMap(stateService => stateService.resolve(parentId)));

  return combineLatest([
    $stateService.get(vine),
    containerSpec$,
  ])
      .pipe(
          switchMap(([stateService, containerSpec]) => {
            if (!containerSpec) {
              return observableOf([]);
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

                  return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
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
                      const decorator: Decorator<NodeWithId<Node>> = () => $setParent
                          .get(vine)
                          .pipe(
                              tap(setParent => {
                                setParent(id, parentId);
                              }),
                          );

                      const decorators: Array<Decorator<NodeWithId<any>>> = [decorator];
                      if (spec.decorator) {
                        decorators.push(spec.decorator);
                      }

                      return {
                        ...spec,
                        decorator: (node: NodeWithId<Node>): Observable<unknown> => {
                          return applyDecorators<NodeWithId<Node>>(node, ...decorators);
                        },
                      };
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

import {$stateService, Vine} from 'grapevine';
import {$asArray, $asMap, $filterNonNull, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {Decorator, NodeWithId, RenderSpec} from 'persona';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {Indexed} from '../coordinate/indexed';
import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/render-object-spec';
import {CoordinateTypes, IsContainer} from '../payload/is-container';


export function renderContents(
    containerId: StateId<IsContainer<CoordinateTypes>>,
    vine: Vine,
): Observable<readonly RenderSpec[]> {
  const stateService = $stateService.get(vine);
  const containerSpec$ = stateService.resolve(containerId);

  return combineLatest([containerSpec$, containerSpec$.$('$contentSpecs')])
      .pipe(
          switchMap(([containerSpec, contentIds]) => {
            if (!containerSpec) {
              return of([]);
            }

            const getRenderSpec = $getRenderSpec.get(vine);
            const node$list = $pipe(
                contentIds ?? [],
                $map(({objectId, coordinate}) => {
                  return getRenderSpec(objectId).pipe(
                      map(spec => spec ? [coordinate, {id: objectId, spec}] as const : null),
                  );
                }),
                $asArray(),
            );

            const nodes$ = node$list.length <= 0 ? of([]) : combineLatest(node$list);
            return nodes$.pipe(
                map(pairs => {
                  const contents = $pipe(pairs, $filterNonNull(), $asMap());
                  switch (containerSpec.containerType) {
                    case 'indexed':
                      return renderIndexed(contents);
                  }
                }),
                map(renderSpecs => $pipe(
                    renderSpecs,
                    $map(({id, spec}) => {
                      const decorator: Decorator<NodeWithId<Node>> = () => {
                        $setParent.get(vine)(id, containerId);
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

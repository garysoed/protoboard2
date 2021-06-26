import {$stateService, Vine} from 'grapevine';
import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {Decorator, NodeWithId, RenderSpec} from 'persona';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/render-object-spec';
import {IsContainer} from '../payload/is-container';


export function renderContents(
    containerId: StateId<IsContainer>,
    vine: Vine,
): Observable<readonly RenderSpec[]> {
  const stateService = $stateService.get(vine);
  const containerSpec$ = stateService.resolve(containerId);

  return combineLatest([containerSpec$, containerSpec$.$('contentsId')])
      .pipe(
          switchMap(([containerSpec, contentIds]) => {
            if (!containerSpec) {
              return of([]);
            }

            const getRenderSpec = $getRenderSpec.get(vine);
            const node$list = $pipe(
                contentIds ?? [],
                $map(objectId => {
                  return getRenderSpec(objectId).pipe(
                      map(spec => spec ? {id: objectId, spec} : null),
                  );
                }),
                $asArray(),
            );

            const nodes$ = node$list.length <= 0 ? of([]) : combineLatest(node$list);
            return nodes$.pipe(
                map(renderSpecs => $pipe(
                    renderSpecs,
                    $filterNonNull(),
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

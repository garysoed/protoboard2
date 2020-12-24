import {$asArray, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {filterNonNull} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {applyDecorators, Decorator, NodeWithId, PersonaContext, RenderSpec} from 'persona';
import {MultiOutput} from 'persona/export/internal';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {Indexed} from '../coordinate/indexed';
import {$setParent} from '../objects/content-map';
import {$getRenderSpec} from '../objects/object-create-spec';
import {CoordinateTypes} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';


const LOGGER = new Logger('protoboard2.renderContents');


export function renderContents(
    parentId$: Observable<StateId<ContainerSpec<unknown, CoordinateTypes>>>,
    output: MultiOutput,
    context: PersonaContext,
): Observable<unknown> {
  const containerSpec$ = combineLatest([
    $stateService.get(context.vine),
    parentId$,
  ])
      .pipe(
          switchMap(([stateService, parentId]) => {
            return stateService.get(parentId);
          }),
      );

  return combineLatest([
    $stateService.get(context.vine),
    containerSpec$,
    parentId$,
  ])
      .pipe(
          switchMap(([stateService, containerSpec, parentId]) => {
            if (!containerSpec) {
              return observableOf([]);
            }

            return stateService.get(containerSpec.payload.$contentSpecs).pipe(
                withLatestFrom($getRenderSpec.get(context.vine)),
                switchMap(([contentIds, getRenderSpec]) => {
                  const node$list = $pipe(
                      contentIds ?? [],
                      $map(({objectId, coordinate}) => {
                        return getRenderSpec(objectId, context).pipe(
                            take(1),
                            filterNonNull(),
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
                      const decorator: Decorator<NodeWithId<Node>> = () => $setParent.get(context.vine).pipe(
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
          output.output(context),
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

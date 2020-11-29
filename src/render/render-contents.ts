import {$asArray, $map, $pipe, $sort, normal, withMap} from 'gs-tools/export/collect';
import {filterNonNull} from 'gs-tools/export/rxjs';
import {$stateService} from 'mask';
import {NodeWithId, PersonaContext} from 'persona';
import {MultiOutput} from 'persona/export/internal';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {Indexed} from '../coordinate/indexed';
import {$getObjectNode} from '../objects/object-service';
import {IsContainer} from '../payload/is-container';


const LOGGER = new Logger('protoboard2.renderContents');


interface ContainerSpecLike {
  readonly payload: IsContainer<'indexed'>;
}


export function renderContents(
    containerSpec$: Observable<ContainerSpecLike|null>,
    output: MultiOutput,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), containerSpec$]).pipe(
      switchMap(([stateService, containerSpec]) => {
        if (!containerSpec) {
          return observableOf([]);
        }

        return stateService.get(containerSpec.payload.$contentSpecs).pipe(
            withLatestFrom($getObjectNode.get(context.vine)),
            switchMap(([contentIds, getObjectNode]) => {
              const node$list = $pipe(
                  contentIds ?? [],
                  $map(({objectId, coordinate}) => {
                    return getObjectNode(objectId, context).pipe(
                        take(1),
                        filterNonNull(),
                        map(node => [coordinate, node] as const),
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
        );
      }),
      output.output(context),
  );
}

function renderIndexed(
    contents: ReadonlyMap<Indexed, NodeWithId<Node>>,
): ReadonlyArray<NodeWithId<Node>> {
  return $pipe(
      [...contents],
      $sort(withMap(([coordinate]) => coordinate.index, normal())),
      $map(([, node]) => node),
      $asArray(),
  );
}


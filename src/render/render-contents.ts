import { $asArray, $map, $pipe, $sort, normal, withMap } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { MultiOutput } from 'persona/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { Indexed } from '../coordinate/indexed';
import { $objectService } from '../objects/object-service';
import { CoordinateTypes, IsContainer } from '../payload/is-container';


export function renderContents(
    isContainer$: Observable<IsContainer<CoordinateTypes>|null>,
    output: MultiOutput,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isContainer$]).pipe(
      switchMap(([stateService, isContainer]) => {
        if (!isContainer) {
          return observableOf([]);
        }

        return stateService.get(isContainer.$contentSpecs).pipe(
            withLatestFrom($objectService.get(context.vine)),
            switchMap(([contentIds, renderableService]) => {
              const node$list = $pipe(
                  contentIds ?? [],
                  $map(({objectId, coordinate}) => {
                    return renderableService.getObject(objectId, context).pipe(
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
              switch (isContainer.containerType) {
                case 'indexed':
                  return renderIndexed(new Map(pairs));
              }
            }),
        );
      }),
      output.output(context),
  );
}

function renderIndexed(contents: ReadonlyMap<Indexed, Node>): readonly Node[] {
  return $pipe(
      [...contents],
      $sort(withMap(([coordinate]) => coordinate.index, normal())),
      $map(([, node]) => node),
      $asArray(),
  );
}


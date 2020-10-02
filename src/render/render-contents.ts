import { $asArray, $map, $pipe, $sort, normal, withMap } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { MultiOutput } from 'persona/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { Indexed } from '../coordinate/indexed';
import { $objectService } from '../objects/object-service';
import { IsContainer } from '../payload/is-container';


export function renderContents(
    isContainer$: Observable<IsContainer<'indexed'>|null>,
    output: MultiOutput,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isContainer$]).pipe(
      switchMap(([stateService, isContainer]) => {
        if (!isContainer) {
          return observableOf(null);
        }

        return stateService.get(isContainer.$contentSpecs);
      }),
      withLatestFrom($objectService.get(context.vine)),
      switchMap(([contentIds, renderableService]) => {
        const node$list = $pipe(
            contentIds ?? [],
            $sort(withMap(({coordinate}) => coordinate.index, normal())),
            $map(({objectId}) => {
              return renderableService.getObject(objectId, context).pipe(filterNonNull());
            }),
            $asArray(),
        );

        return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
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


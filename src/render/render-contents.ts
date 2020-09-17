import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { MultiOutput } from 'persona/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../action/payload/is-container';
import { $objectService } from '../objects/object-service';


export function renderContents(
    isContainer$: Observable<IsContainer|null>,
    output: MultiOutput,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isContainer$]).pipe(
      switchMap(([stateService, isContainer]) => {
        if (!isContainer) {
          return observableOf(null);
        }

        return stateService.get(isContainer.$contentIds);
      }),
      withLatestFrom($objectService.get(context.vine)),
      switchMap(([contentIds, renderableService]) => {
        const node$list = $pipe(
            contentIds ?? [],
            $map(id => renderableService.getObject(id, context).pipe(filterNonNull())),
            $filterNonNull(),
            $asArray(),
        );

        return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
      }),
      output.output(context),
  );
}


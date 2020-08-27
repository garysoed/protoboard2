import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { DroppablePayload } from '../action/payload/droppable-payload';
import { State } from '../state/state';
import { $stateService } from '../state/state-service';


export function renderContents(
    state: State<DroppablePayload>,
    context: PersonaContext,
): Observable<readonly Node[]> {
  return state.payload.contentIds.pipe(
      withLatestFrom($stateService.get(context.vine)),
      switchMap(([contentIds, stateService]) => {
        const node$list = $pipe(
            contentIds,
            $map(id => stateService.getObject(id, context).pipe(filterNonNull())),
            $filterNonNull(),
            $asArray(),
        );

        return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
      }),
  );
}


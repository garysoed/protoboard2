import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { DroppablePayload } from '../action/payload/droppable-payload';
import { $renderableService } from '../state-old/renderable-service';
import { State } from '../state-old/state';


export function renderContents(
    state: State<DroppablePayload>|null,
    context: PersonaContext,
): Observable<readonly Node[]> {
  if (!state) {
    return observableOf([]);
  }

  return state.payload.contentIds.pipe(
      withLatestFrom($renderableService.get(context.vine)),
      switchMap(([contentIds, renderableService]) => {
        const node$list = $pipe(
            contentIds,
            $map(id => renderableService.getObject(id, context).pipe(filterNonNull())),
            $filterNonNull(),
            $asArray(),
        );

        return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
      }),
  );
}


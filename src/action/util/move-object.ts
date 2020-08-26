import { Vine } from 'grapevine';
import { $asArray, $filter, $pipe } from 'gs-tools/export/collect';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { State } from '../../state/state';
import { $stateService } from '../../state/state-service';
import { DroppablePayload } from '../payload/droppable-payload';
import { MovablePayload } from '../payload/movable-payload';

export function moveObject(
    movedObjectState: State<MovablePayload>,
    destinationObjectState: State<DroppablePayload>,
    vine: Vine,
): Observable<unknown> {
  return combineLatest([
    movedObjectState.payload.parentId,
    $stateService.get(vine),
  ])
  .pipe(
      take(1),
      switchMap(([parentId, service]) => {
        if (!parentId) {
          return observableOf(null);
        }
        return service.getState<DroppablePayload>(parentId);
      }),
      take(1),
      tap(parentState => {
        // Remove the moved object from the current parent.
        if (parentState) {
          const parentContentIds$ = parentState.payload.contentIds;
          parentContentIds$.next($pipe(
              parentContentIds$.getValue(),
              $filter(contentId => contentId !== movedObjectState.id),
              $asArray(),
          ));
        }

        // Set the new parent of the moved object.
        movedObjectState.payload.parentId.next(destinationObjectState.id);

        // Add the moved object to the destination.
        const destinationContentIds$ = destinationObjectState.payload.contentIds;
        destinationContentIds$.next([...destinationContentIds$.getValue(), movedObjectState.id]);
      }),
      take(1),
  );
}

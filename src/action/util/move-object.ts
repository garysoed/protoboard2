import { mod } from 'gs-tools/export/math';
import { combineLatest, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { ObjectSpec } from '../../objects/object-spec';
import { DroppablePayload } from '../payload/droppable-payload';


export function moveObject(
    fromObjectState: ObjectSpec<DroppablePayload>,
    toObjectState: ObjectSpec<DroppablePayload>,
    fromLocation: number,
    toLocation: number,
): Observable<unknown> {
  return combineLatest([
    fromObjectState.payload.contentIds,
    toObjectState.payload.contentIds,
  ])
  .pipe(
      take(1),
      tap(([fromContentIds, toContentIds]) => {
        // Remove the moved object from the current parent.
        const newFromContentIds = [...fromContentIds];
        const [movedId] = newFromContentIds.splice(mod(fromLocation, fromContentIds.length), 1);
        fromObjectState.payload.contentIds.next(newFromContentIds);

        // Add the moved object to the destination.
        const newToContentIds = [...toContentIds];
        newToContentIds.splice(mod(toLocation, toContentIds.length), 0, movedId);
        toObjectState.payload.contentIds.next(newToContentIds);
      }),
  );
}

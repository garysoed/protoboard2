import { Vine } from 'grapevine';
import { mod } from 'gs-tools/export/math';
import { StateId } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';


export function moveObject(
    $fromContentIds: StateId<readonly string[]>,
    $toContentIds: StateId<readonly string[]>,
    fromLocation: number,
    toLocation: number,
    vine: Vine,
): Observable<unknown> {
  return $stateService.get(vine).pipe(
      take(1),
      switchMap(stateService => {
        return combineLatest([
          stateService.get($fromContentIds),
          stateService.get($toContentIds),
        ])
        .pipe(
            take(1),
            tap(([fromContentIds, toContentIds]) => {
              if (!fromContentIds || !toContentIds) {
                return;
              }
              // Remove the moved object from the current parent.
              const newFromContentIds = [...fromContentIds];
              const [movedId] = newFromContentIds
                  .splice(mod(fromLocation, fromContentIds.length), 1);
              stateService.set($fromContentIds, newFromContentIds);

              // Add the moved object to the destination.
              const newToContentIds = [...toContentIds];
              newToContentIds.splice(mod(toLocation, toContentIds.length), 0, movedId);
              stateService.set($toContentIds, newToContentIds);
            }),
        );
      }),
  );
}

import { Vine } from 'grapevine';
import { $asArray, $filter, $pipe } from 'gs-tools/export/collect';
import { $stateService } from 'mask';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { CoordinateTypes, IsContainer, TypeCoordinateMapping } from '../../payload/is-container';


export function moveObject<F extends CoordinateTypes, T extends CoordinateTypes>(
    fromContainer: IsContainer<F>,
    toContainer: IsContainer<T>,
    movedObjectId: string,
    toLocation: TypeCoordinateMapping[T],
    vine: Vine,
): Observable<unknown> {
  return $stateService.get(vine).pipe(
      take(1),
      switchMap(stateService => {
        return combineLatest([
          stateService.get(fromContainer.$contentSpecs),
          stateService.get(toContainer.$contentSpecs),
        ])
        .pipe(
            take(1),
            tap(([fromContentSpecs, toContentSpecs]) => {
              if (!fromContentSpecs || !toContentSpecs) {
                return;
              }

              stateService.set(
                  fromContainer.$contentSpecs,
                  $pipe(
                      fromContentSpecs,
                      $filter(spec => spec.objectId !== movedObjectId),
                      $asArray(),
                  ),
              );

              // Add the moved object to the destination.
              const newToContentSpecs = [
                ...toContentSpecs,
                {objectId: movedObjectId, coordinate: toLocation},
              ];
              stateService.set(toContainer.$contentSpecs, newToContentSpecs);
            }),
        );
      }),
  );
}

export function computeDistance<T extends CoordinateTypes>(
    type: T,
    a: TypeCoordinateMapping[T],
    b: TypeCoordinateMapping[T],
): number {
  switch (type) {
    case 'indexed':
      return Math.abs(a.index - b.index);
    default:
      throw new Error(`Unimplemented type: ${type}`);
  }
}

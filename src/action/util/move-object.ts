import {Vine} from 'grapevine';
import {$asArray, $filter, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {Observable, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {CoordinateTypes, IsContainer, TypeCoordinateMapping} from '../../payload/is-container';
import {ObjectSpec} from '../../types/object-spec';


type MoveObjectFn<T extends CoordinateTypes> =
    (movedObjectId: StateId<ObjectSpec<any>>, toLocation: TypeCoordinateMapping[T]) => void;
export function moveObject<F extends CoordinateTypes, T extends CoordinateTypes>(
    fromContainer: IsContainer<F>,
    toContainer: IsContainer<T>,
    vine: Vine,
): Observable<MoveObjectFn<T>|null> {
  return $stateService.get(vine).pipe(
      switchMap(stateService => {
        return combineLatest([
          stateService.get(fromContainer.$contentSpecs),
          stateService.get(toContainer.$contentSpecs),
        ])
            .pipe(
                map(([fromContentSpecs, toContentSpecs]) => {
                  if (!fromContentSpecs || !toContentSpecs) {
                    return null;
                  }

                  return (movedObjectId: StateId<ObjectSpec<any>>, toLocation: TypeCoordinateMapping[T]) => {
                    stateService.set(
                        fromContainer.$contentSpecs,
                        $pipe(
                            fromContentSpecs,
                            $filter(spec => spec.objectId.id !== movedObjectId.id),
                            $asArray(),
                        ),
                    );

                    // Add the moved object to the destination.
                    const newToContentSpecs = [
                      ...toContentSpecs,
                      {objectId: movedObjectId, coordinate: toLocation},
                    ];
                    stateService.set(toContainer.$contentSpecs, newToContentSpecs);
                  };
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

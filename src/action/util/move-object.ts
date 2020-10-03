import { Vine } from 'grapevine';
import { $asArray, $filter, $min, $pipe, normal, withMap } from 'gs-tools/export/collect';
import { $stateService } from 'mask';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { ContentSpec, CoordinateTypes, IsContainer, TypeCoordinateMapping } from '../../payload/is-container';


export function moveObject<F extends CoordinateTypes, T extends CoordinateTypes>(
    fromContainer: IsContainer<F>,
    toContainer: IsContainer<T>,
    fromLocation: TypeCoordinateMapping[F],
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

              // Compute the distance to all the from contents and get the minimum item.
              const movedSpec: ContentSpec<TypeCoordinateMapping[F]>|null = $pipe(
                  fromContentSpecs,
                  $min(
                      withMap(
                          (spec: ContentSpec<TypeCoordinateMapping[F]>) => computeDistance(
                              fromContainer.type,
                              spec.coordinate,
                              fromLocation,
                          ),
                          normal(),
                      ),
                  ),
              );

              if (!movedSpec) {
                return;
              }
              stateService.set(
                  fromContainer.$contentSpecs,
                  $pipe(fromContentSpecs, $filter(spec => spec !== movedSpec), $asArray()),
              );

              // Add the moved object to the destination.
              const newToContentSpecs = [
                ...toContentSpecs,
                {objectId: movedSpec.objectId, coordinate: toLocation},
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

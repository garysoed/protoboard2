import {$stateService, Vine} from 'grapevine';
import {$asArray, $filter, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {IsContainer} from '../../payload/is-container';


type MoveObjectFn = (movedObjectId: StateId<unknown>, toIndex: number) => void;
export function moveObject(
    fromContainer: IsContainer,
    toContainer: IsContainer,
    vine: Vine,
): Observable<MoveObjectFn|null> {
  const stateService = $stateService.get(vine);
  return combineLatest([
    stateService.resolve(fromContainer.$contentSpecs),
    stateService.resolve(toContainer.$contentSpecs),
  ])
      .pipe(
          map(([fromContentSpecs, toContentSpecs]) => {
            if (!fromContentSpecs || !toContentSpecs) {
              return null;
            }

            return (movedObjectId: StateId<unknown>, toIndex: number) => {
              stateService.modify(x => {
                x.set(
                    fromContainer.$contentSpecs,
                    $pipe(
                        fromContentSpecs,
                        $filter(spec => spec.id !== movedObjectId.id),
                        $asArray(),
                    ),
                );

                // Add the moved object to the destination.
                const newToContentSpecs = [...toContentSpecs];
                newToContentSpecs.splice(toIndex, 0, movedObjectId);
                x.set(toContainer.$contentSpecs, newToContentSpecs);
              });
            };
          }),
      );
}


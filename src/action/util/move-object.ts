import {$stateService, Vine} from 'grapevine';
import {$asArray, $filter, $pipe} from 'gs-tools/export/collect';
import {Resolver, StateId} from 'gs-tools/export/state';
import {OperatorFunction, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {IsContainer} from '../../payload/is-container';


interface Params {
  readonly id: StateId<unknown>;
  readonly toIndex: number;
}

export function moveObject(
    fromContainer: Resolver<IsContainer>,
    toContainer: Resolver<IsContainer>,
    vine: Vine,
): OperatorFunction<Params, unknown> {
  const stateService = $stateService.get(vine);

  return pipe(
      withLatestFrom(
          fromContainer.$('contentsId'),
          toContainer.$('contentsId'),
          fromContainer._('contentsId'),
          toContainer._('contentsId'),
      ),
      tap(([{id, toIndex}, fromContentSpecs, toContentSpecs, $fromContentSpecs, $toContentSpecs]) => {
        if (!fromContentSpecs || !toContentSpecs || !$fromContentSpecs || !$toContentSpecs) {
          return;
        }
        stateService.modify(x => {
          x.set(
              $fromContentSpecs,
              $pipe(
                  fromContentSpecs,
                  $filter(spec => spec.id !== id.id),
                  $asArray(),
              ),
          );

          // Add the moved object to the destination.
          const newToContentSpecs = [...toContentSpecs];
          newToContentSpecs.splice(toIndex, 0, id);
          x.set($toContentSpecs, newToContentSpecs);
        });
      }),
  );
}


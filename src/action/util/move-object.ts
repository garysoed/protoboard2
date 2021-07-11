import {$asArray, $filter, $pipe} from 'gs-tools/export/collect';
import {ImmutableResolver, ObjectPath} from 'gs-tools/export/state';
import {EMPTY, merge, of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';

import {IsContainer} from '../../payload/is-container';


interface Params {
  readonly id: ObjectPath<unknown>;
  readonly toIndex: number;
}

export function moveObject(
    fromContainer: ImmutableResolver<IsContainer>,
    toContainer: ImmutableResolver<IsContainer>,
): OperatorFunction<Params, unknown> {
  return pipe(
      withLatestFrom(fromContainer.$('contentsId'), toContainer.$('contentsId')),
      switchMap(([{id, toIndex}, fromContentSpecs, toContentSpecs]) => {
        if (!fromContentSpecs || !toContentSpecs) {
          return EMPTY;
        }

        const newFromContentSpecs = $pipe(
            fromContentSpecs,
            $filter(spec => spec.id !== id.id),
            $asArray(),
        );

        // Add the moved object to the destination.
        const newToContentSpecs = [...toContentSpecs];
        newToContentSpecs.splice(toIndex, 0, id);

        return merge(
            of(newFromContentSpecs).pipe(fromContainer.$('contentsId').set()),
            of(newToContentSpecs).pipe(toContainer.$('contentsId').set()),
        );
      }),
  );
}


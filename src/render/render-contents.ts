import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../action/payload/is-container';
import { $objectService } from '../objects/object-service';
import { ObjectSpec } from '../objects/object-spec';


export function renderContents(
    state: ObjectSpec<IsContainer>|null,
    context: PersonaContext,
): Observable<readonly Node[]> {
  if (!state) {
    return observableOf([]);
  }

  return $stateService.get(context.vine).pipe(
      switchMap(stateService => stateService.get(state.payload.$contentIds)),
      withLatestFrom($objectService.get(context.vine)),
      switchMap(([contentIds, renderableService]) => {
        const node$list = $pipe(
            contentIds || [],
            $map(id => renderableService.getObject(id, context).pipe(filterNonNull())),
            $filterNonNull(),
            $asArray(),
        );

        return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
      }),
  );
}


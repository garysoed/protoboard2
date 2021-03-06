import {$stateService} from 'grapevine';
import {PersonaContext} from 'persona';
import {AttributeOutput} from 'persona/export/internal';
import {Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {IsMultifaced} from '../payload/is-multifaced';


export function renderMultifaced(
    isMultifaced$: Observable<IsMultifaced|undefined>,
    slotNameOutput: AttributeOutput<string|undefined>,
    context: PersonaContext,
): Observable<unknown> {
  return isMultifaced$.pipe(
      switchMap(isMultifaced => {
        if (!isMultifaced) {
          return observableOf(null);
        }

        return $stateService.get(context.vine).resolve(isMultifaced.$currentFaceIndex);
      }),
      map(faceIndex => `face-${faceIndex ?? 0}`),
      slotNameOutput.output(context),
  );
}


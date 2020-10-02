import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { AttributeOutput } from 'persona/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IsMultifaced } from '../payload/is-multifaced';


export function renderMultifaced(
    isMultifaced$: Observable<IsMultifaced|null>,
    slotNameOutput: AttributeOutput<string>,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isMultifaced$]).pipe(
      switchMap(([stateService, isContainer]) => {
        if (!isContainer) {
          return observableOf(null);
        }

        return stateService.get(isContainer.$currentFaceIndex);
      }),
      map(faceIndex => `face-${faceIndex ?? 0}`),
      slotNameOutput.output(context),
  );
}


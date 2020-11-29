import {$stateService} from 'mask';
import {PersonaContext} from 'persona';
import {AttributeOutput} from 'persona/export/internal';
import {Observable, combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';


export function renderMultifaced(
    isMultifaced$: Observable<PieceSpec<IsMultifaced>|null>,
    slotNameOutput: AttributeOutput<string>,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isMultifaced$]).pipe(
      switchMap(([stateService, isMultifaced]) => {
        if (!isMultifaced) {
          return observableOf(null);
        }

        return stateService.get(isMultifaced.payload.$currentFaceIndex);
      }),
      map(faceIndex => `face-${faceIndex ?? 0}`),
      slotNameOutput.output(context),
  );
}


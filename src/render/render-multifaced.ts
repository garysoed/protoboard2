import {ImmutableResolver} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {AttributeOutput} from 'persona/export/internal';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {IsMultifaced} from '../payload/is-multifaced';


export function renderMultifaced(
    isMultifaced: ImmutableResolver<IsMultifaced>,
    slotNameOutput: AttributeOutput<string|undefined>,
    context: PersonaContext,
): Observable<unknown> {
  return isMultifaced.$('currentFaceIndex').pipe(
      map(faceIndex => `face-${faceIndex ?? 0}`),
      slotNameOutput.output(context),
  );
}


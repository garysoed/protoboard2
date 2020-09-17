import { $stateService } from 'mask';
import { PersonaContext } from 'persona';
import { StyleOutput } from 'persona/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IsRotatable } from '../action/payload/is-rotatable';


export function renderRotatable(
    isRotatable$: Observable<IsRotatable|null>,
    output: StyleOutput<'transform'>,
    context: PersonaContext,
): Observable<unknown> {
  return combineLatest([$stateService.get(context.vine), isRotatable$]).pipe(
      switchMap(([stateService, isRotatable]) => {
        if (!isRotatable) {
          return observableOf(null);
        }

        return stateService.get(isRotatable.$rotationDeg);
      }),
      map(rotationDeg => `rotateZ(${rotationDeg ?? 0}deg)`),
      output.output(context),
  );
}

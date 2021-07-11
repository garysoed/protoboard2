import {ImmutableResolver} from 'gs-tools/export/state';
import {PersonaContext, style} from 'persona';
import {combineLatest, EMPTY, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {IsRotatable} from '../payload/is-rotatable';


export function renderRotatable(
    isRotatable: ImmutableResolver<IsRotatable>,
    slottedNodes$: Observable<readonly Node[]>,
    context: PersonaContext,
): Observable<unknown> {
  const rotation$ = isRotatable.$('rotationDeg').pipe(
      map(rotationDeg => `rotateZ(${rotationDeg ?? 0}deg)`),
  );

  return combineLatest([rotation$, slottedNodes$]).pipe(
      switchMap(([rotation, slottedNodes]) => {
        const targetEl = slottedNodes[0];
        if (!(targetEl instanceof HTMLElement)) {
          return EMPTY;
        }

        return observableOf(rotation)
            .pipe(style('transform').resolve(() => targetEl).output(context));
      }),
  );
}

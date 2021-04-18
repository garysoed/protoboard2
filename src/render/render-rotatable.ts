import {$stateService} from 'grapevine';
import {PersonaContext, style} from 'persona';
import {combineLatest, EMPTY, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';


export function renderRotatable(
    isRotatable$: Observable<PieceSpec<IsRotatable>|undefined>,
    slottedNodes$: Observable<readonly Node[]>,
    context: PersonaContext,
): Observable<unknown> {
  const rotation$ = isRotatable$.pipe(
      switchMap(pieceSpec => {
        if (!pieceSpec) {
          return observableOf(undefined);
        }

        return $stateService.get(context.vine).resolve(pieceSpec.payload.$rotationDeg);
      }),
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

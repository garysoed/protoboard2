import {$stateService} from 'mask';
import {PersonaContext, style} from 'persona';
import {EMPTY, Observable, combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('protoboard2.renderRotatable');


export function renderRotatable(
    isRotatable$: Observable<PieceSpec<IsRotatable>|null>,
    slottedNodes$: Observable<readonly Node[]>,
    context: PersonaContext,
): Observable<unknown> {
  const rotation$ = combineLatest([$stateService.get(context.vine), isRotatable$]).pipe(
      switchMap(([stateService, pieceSpec]) => {
        if (!pieceSpec) {
          return observableOf(null);
        }

        return stateService.get(pieceSpec.payload.$rotationDeg);
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

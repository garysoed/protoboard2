import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {$getFaceRenderSpec$} from '../renderspec/render-face-spec';


export function renderFace(
    vine: Vine,
    faceId$: Observable<unknown>,
    renderFn: (render: (faceId: unknown) => RenderSpec|null) => OperatorFunction<unknown, unknown>,
): Observable<unknown> {
  return combineLatest([
    faceId$,
    $getFaceRenderSpec$.get(vine),
  ])
      .pipe(
          switchMap(([faceId, getFaceRenderSpec]) => {
            return of(faceId).pipe(
                renderFn(faceId => getFaceRenderSpec(faceId)),
            );
          }),
      );
}
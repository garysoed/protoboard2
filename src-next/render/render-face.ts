import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {FaceId} from '../id/face-id';
import {$getFaceRenderSpec$} from '../renderspec/render-face-spec';

type RenderFn = (payload: unknown, faceId: FaceId<unknown>) => RenderSpec|null;

export function renderFace(
    vine: Vine,
    faceId$: Observable<FaceId<unknown>>,
    renderFn: (render: RenderFn) => OperatorFunction<FaceId<unknown>, FaceId<unknown>>,
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
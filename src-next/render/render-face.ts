import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

import {FaceId} from '../id/face-id';
import {$getFaceRenderSpec$} from '../renderspec/render-face-spec';

type RenderFn = OperatorFunction<FaceId<unknown>, RenderSpec|null>;

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
            // TODO: Get rid of the of()
            return of(faceId).pipe(
                renderFn(map(faceId => getFaceRenderSpec(faceId))),
            );
          }),
      );
}
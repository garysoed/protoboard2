import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getFaceRenderSpec$} from '../renderspec/render-face-spec';

export function renderFace(vine: Vine, faceId: unknown): Observable<RenderSpec|null> {
  return $getFaceRenderSpec$.get(vine).pipe(
      map(getFaceRenderSpec => getFaceRenderSpec(faceId)),
  );
}
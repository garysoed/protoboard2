import {filterNonNullable} from 'gs-tools/export/rxjs';
import {ocase, renderElement, RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {LENS} from '../face/lens';
import {FaceSpec} from '../types/is-multifaced';

export function renderFace(): OperatorFunction<FaceSpec, RenderSpec|null> {
  return map(faceSpec => renderElement({
    registration: LENS,
    spec: {
      content: ocase<RenderSpec|null>(),
    },
    runs: $ => [
      faceSpec.renderSpec$.pipe($.content(map(spec => spec))),
      faceSpec.renderLensSpec$.pipe(filterNonNullable(), $.renderSpec()),
    ],
  }));
}
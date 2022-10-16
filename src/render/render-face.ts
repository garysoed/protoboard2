import {RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {FaceSpec} from '../types/is-multifaced';

export function renderFace(): OperatorFunction<FaceSpec, RenderSpec|null> {
  return switchMap(faceSpec => faceSpec.renderSpec$);
}
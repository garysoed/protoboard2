import {RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {FaceSpec} from '../types/is-multifaced';

export function renderFace(): OperatorFunction<FaceSpec, RenderSpec|null> {
  return map(faceSpec => faceSpec.renderFn());
}
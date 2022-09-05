import {MutableState} from 'gs-tools/export/state';
import {hasPropertiesType, instanceofType, Type} from 'gs-types';
import {RenderSpec} from 'persona';

export interface FaceSpec {
  readonly renderFn: () => RenderSpec|null;
  readonly renderLensFn: () => RenderSpec|null;
}

export const FACE_SPEC_TYPE: Type<FaceSpec> = hasPropertiesType({
  renderFn: instanceofType<() => RenderSpec|null>(Function),
  renderLensFn: instanceofType<() => RenderSpec|null>(Function),
});

export interface IsMultifaced {
  readonly currentFaceIndex: MutableState<number>;
  readonly faces: readonly FaceSpec[];
}

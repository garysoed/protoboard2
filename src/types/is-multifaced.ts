import {arrayOfType, hasPropertiesType, instanceofType, Type} from 'gs-types';
import {RenderSpec} from 'persona';
import {Subject} from 'rxjs';

export interface FaceSpec {
  readonly renderFn: () => RenderSpec|null;
  readonly renderLensFn: () => RenderSpec|null;
}

export const FACE_SPEC_TYPE: Type<FaceSpec> = hasPropertiesType({
  renderFn: instanceofType<() => RenderSpec|null>(Function),
  renderLensFn: instanceofType<() => RenderSpec|null>(Function),
});

export interface IsMultifaced {
  readonly currentFaceIndex: Subject<number>;
  readonly faces: readonly FaceSpec[];
}

export const IS_MULTIFACED_TYPE: Type<IsMultifaced> = hasPropertiesType({
  currentFaceIndex: instanceofType<Subject<number>>(Subject),
  faces: arrayOfType(FACE_SPEC_TYPE),
});
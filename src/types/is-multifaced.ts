import {arrayOfType, hasPropertiesType, instanceofType, Type} from 'gs-types';
import {RenderSpec} from 'persona';
import {Observable, Subject} from 'rxjs';

export interface FaceSpec {
  readonly renderSpec$: Observable<RenderSpec|null>;
  readonly renderLensSpec$: Observable<RenderSpec|null>;
}

export const FACE_SPEC_TYPE: Type<FaceSpec> = hasPropertiesType({
  renderSpec$: instanceofType<Observable<RenderSpec|null>>(Observable),
  renderLensSpec$: instanceofType<Observable<RenderSpec|null>>(Observable),
});

export interface IsMultifaced {
  readonly currentFaceIndex: Subject<number>;
  readonly faces: readonly FaceSpec[];
}

export const IS_MULTIFACED_TYPE: Type<IsMultifaced> = hasPropertiesType({
  currentFaceIndex: instanceofType<Subject<number>>(Subject),
  faces: arrayOfType(FACE_SPEC_TYPE),
});
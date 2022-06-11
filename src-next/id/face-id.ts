import {hasPropertiesType, stringType, Type} from 'gs-types';

const __payload = Symbol('faceId');

export interface FaceId<T> {
  readonly [__payload]: T;
}

export function faceId<T>(payload: T): FaceId<T> {
  return {[__payload]: payload};
}

export function getPayload<T>(id: FaceId<T>): T {
  return id[__payload];
}

export const FACE_ID_TYPE: Type<FaceId<string>> = hasPropertiesType({
  [__payload]: stringType,
});
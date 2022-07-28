import {hasPropertiesType, Type} from 'gs-types';

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

export function faceIdType<T>(payloadType: Type<T>): Type<FaceId<T>> {
  return hasPropertiesType({
    [__payload]: payloadType,
  });
}

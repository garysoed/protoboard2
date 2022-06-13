import {hasPropertiesType, Type} from 'gs-types';

const __payload = Symbol('stampId');

export interface StampId<T> {
  readonly [__payload]: T;
}

export function stampId<T>(payload: T): StampId<T> {
  return {[__payload]: payload};
}

export function getPayload<T>(id: StampId<T>): T {
  return id[__payload];
}

export function stampIdType<T>(payloadType: Type<T>): Type<StampId<T>> {
  return hasPropertiesType({
    [__payload]: payloadType,
  });
}

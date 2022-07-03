import {hasPropertiesType, Type} from 'gs-types';

const __payload = Symbol('lineId');

export interface LineId<T> {
  readonly [__payload]: T;
}

export function lineId<T>(payload: T): LineId<T> {
  return {[__payload]: payload};
}

export function getPayload<T>(id: LineId<T>): T {
  return id[__payload];
}

export function lineIdType<T>(payloadType: Type<T>): Type<LineId<T>> {
  return hasPropertiesType({
    [__payload]: payloadType,
  });
}

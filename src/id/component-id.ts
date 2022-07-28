import {hasPropertiesType, Type} from 'gs-types';

const __payload = Symbol('componentId');

export interface ComponentId<T> {
  readonly [__payload]: T;
}

export function componentId<T>(payload: T): ComponentId<T> {
  return {[__payload]: payload};
}

export function getPayload<T>(id: ComponentId<T>): T {
  return id[__payload];
}

export function componentIdType<T>(payloadType: Type<T>): Type<ComponentId<T>> {
  return hasPropertiesType({
    [__payload]: payloadType,
  });
}

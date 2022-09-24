import {hasPropertiesType, unknownType} from 'gs-types';

const __id = Symbol('componentId');

export interface ComponentId {
  readonly [__id]: unknown;
}

export function componentId(): ComponentId {
  return {[__id]: {}};
}

export const COMPONENT_ID_TYPE = hasPropertiesType({
  [__id]: unknownType,
});

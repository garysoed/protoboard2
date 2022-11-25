import {hasPropertiesType, unknownType} from 'gs-types';

const __id = Symbol('componentId');

export interface ComponentId {
  readonly [__id]: unknown;
}

export function componentId(label?: string): ComponentId {
  return {[__id]: label ?? 'componentId'};
}

export const COMPONENT_ID_TYPE = hasPropertiesType({
  [__id]: unknownType,
});

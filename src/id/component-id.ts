import {hasPropertiesType, unknownType} from 'gs-types';

const __id = Symbol('componentId');

export interface ComponentId {
  readonly [__id]: unknown;
  toString(): string;
}

export function componentId(label?: string): ComponentId {
  const id = label ?? 'componentId';
  return {
    [__id]: id,
    toString: () => id,
  };
}

export const COMPONENT_ID_TYPE = hasPropertiesType({
  [__id]: unknownType,
});

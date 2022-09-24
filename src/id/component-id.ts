import {hasPropertiesType, unknownType} from 'gs-types';

const __payload = Symbol('componentId');

export interface ComponentId {
  readonly [__payload]: unknown;
}

export function componentId(): ComponentId {
  return {[__payload]: {}};
}

export const COMPONENT_ID_TYPE = hasPropertiesType({
  [__payload]: unknownType,
});

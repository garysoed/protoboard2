import {hasPropertiesType, Type, unknownType} from 'gs-types';

import {ComponentId, componentIdType} from '../id/component-id';

export interface ComponentState {
  readonly id: ComponentId<unknown>;
}

export const COMPONENT_STATE_TYPE: Type<ComponentState> = hasPropertiesType({
  id: componentIdType(unknownType),
});
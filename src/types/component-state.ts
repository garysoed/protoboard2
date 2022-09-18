import {hasPropertiesType, Type} from 'gs-types';

import {ComponentId, COMPONENT_ID_TYPE} from '../id/component-id';

export interface ComponentState {
  readonly id: ComponentId;
}

export const COMPONENT_STATE_TYPE: Type<ComponentState> = hasPropertiesType({
  id: COMPONENT_ID_TYPE,
});
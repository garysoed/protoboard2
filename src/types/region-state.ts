import {intersectType} from 'gs-types';

import {ComponentState, COMPONENT_STATE_TYPE} from './component-state';
import {IsContainer, IS_CONTAINER_TYPE} from './is-container';


export interface RegionState extends ComponentState, IsContainer {
}

export const REGION_STATE_TYPE = intersectType([
  COMPONENT_STATE_TYPE,
  IS_CONTAINER_TYPE,
]);
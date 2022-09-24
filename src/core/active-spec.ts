import {source} from 'grapevine';
import {BehaviorSubject} from 'rxjs';

import {ComponentId, componentId} from '../id/component-id';
import {RegionState} from '../types/region-state';


export type ActiveState = RegionState;

export const $activeState = source<ActiveState>(() => {
  return {
    id: componentId(),
    contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
  };
});

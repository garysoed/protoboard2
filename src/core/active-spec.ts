import {$stateService, source} from 'grapevine';
import {ImmutableResolver, mutableState} from 'gs-tools/export/state';

import {componentId} from '../id/component-id';
import {RegionState} from '../types/region-state';


export type ActiveState = RegionState;

export const $activeState = source<ImmutableResolver<ActiveState>>(vine => {
  const stateService = $stateService.get(vine);
  return stateService.addRoot<ActiveState>({
    id: componentId({}),
    contentIds: mutableState([]),
  })._();
});

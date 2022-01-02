import {$stateService, source} from 'grapevine';
import {ImmutableResolver, mutableState, RootStateId} from 'gs-tools/export/state';

import {RegionState} from '../types/region-state';


export type ActiveState = RegionState;

const $activeStateId = source<RootStateId<ActiveState>>(vine => {
  const stateService = $stateService.get(vine);
  return stateService.addRoot<ActiveState>({
    id: {},
    contentIds: mutableState([]),
  });
});

export const $activeState = source<ImmutableResolver<ActiveState>>(vine =>
  $stateService.get(vine)._($activeStateId.get(vine)),
);
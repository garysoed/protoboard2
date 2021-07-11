import {$stateService, immutablePathSource, source} from 'grapevine';
import {ImmutableResolver, mutableState, RootStateId} from 'gs-tools/export/state';

import {activeSpec, ActiveSpec} from './active';


const $activeSpecId = source<RootStateId<ActiveSpec>>(vine => {
  const stateService = $stateService.get(vine);
  return stateService.addRoot(activeSpec({
    contentsId: mutableState([]),
  }));
});

export const $activeSpecPath = immutablePathSource<ActiveSpec>($activeSpecId);

export const $activeSpec = source<ImmutableResolver<ActiveSpec>>(vine =>
  $stateService.get(vine)._($activeSpecId.get(vine)),
);
import {$resolveState, $stateService, source} from 'grapevine';
import {Resolver, StateId} from 'gs-tools/export/state';

import {activeSpec, ActiveSpec} from './active';


export const $$activeSpec = source<StateId<ActiveSpec>>(
    '$activeSpec',
    vine => {
      const stateService = $stateService.get(vine);
      return stateService.modify(x => x.add(
          activeSpec({
            contentsId: x.add([]),
          }),
      ));
    },
);

export const $activeSpec = source<Resolver<ActiveSpec>>(
    'activeSpec',
    vine => $resolveState.get(vine)($$activeSpec.get(vine)),
);
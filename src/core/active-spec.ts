import {$resolveState, $stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Observable} from 'rxjs';

import {activeSpec, ActiveSpec} from './active';


export const $$activeSpec = source<StateId<ActiveSpec>>(
    '$activeSpec',
    vine => {
      const stateService = $stateService.get(vine);
      return stateService.modify(x => x.add(
          activeSpec({
            $contentSpecs: x.add([]),
          }),
      ));
    },
);

export const $activeSpec = source<Observable<ActiveSpec|undefined>>(
    'activeSpec',
    vine => $resolveState.get(vine)($$activeSpec.get(vine)),
);
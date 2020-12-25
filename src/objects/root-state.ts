import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ActiveSpec} from '../core/active';


export interface RootState {
  readonly $activeState: StateId<ActiveSpec>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

import {subjectSource} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ActiveSpec} from '../core/active';


export interface RootState {
  readonly $activeState: StateId<ActiveSpec>;
}

export const $$rootState = subjectSource<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ActiveSpec} from '../core/active';
import {ObjectSpec} from '../types/object-spec';


export interface RootState {
  readonly $activeState: StateId<ActiveSpec>;
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<any>>>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

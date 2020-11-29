import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {IsContainer} from '../payload/is-container';
import {ActiveSpec} from '../types/active-spec';
import {ObjectSpec} from '../types/object-spec';


export interface RootState {
  // TODO: Rename to $activeSpec
  readonly $activeId: StateId<ActiveSpec>;
  readonly containerIds: ReadonlyArray<StateId<ObjectSpec<IsContainer<any>>>>;
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<any>>>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

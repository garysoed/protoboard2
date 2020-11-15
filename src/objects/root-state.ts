import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ActivePayload} from '../core/active';
import {IsContainer} from '../payload/is-container';

import {ObjectSpec} from './object-spec';


export interface RootState {
  // TODO: Rename to $activeSpec
  readonly $activeId: StateId<ObjectSpec<ActivePayload>>;
  readonly containerIds: ReadonlyArray<StateId<ObjectSpec<IsContainer<any>>>>;
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<any>>>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ActivePayload} from '../core/active';

import {ObjectSpec} from './object-spec';

export interface RootState {
  readonly $activeId: StateId<ObjectSpec<ActivePayload>>;
  readonly objectSpecs: ReadonlyArray<ObjectSpec<any>>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

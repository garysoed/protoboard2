import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {ObjectSpec} from '../types/object-spec';


export interface RootState {
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<any>>>;
}

export const $$rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

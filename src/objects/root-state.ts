import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BehaviorSubject} from 'rxjs';

import {ActiveSpec} from '../core/active';


export interface RootState {
  readonly $activeState: StateId<ActiveSpec>;
}

export const $$rootState = source(
    'objectSpecListId',
    () => new BehaviorSubject<StateId<RootState>|null>(null),
);

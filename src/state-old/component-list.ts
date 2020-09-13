import { source } from 'grapevine';
import { StateId } from 'gs-tools/export/state';

import { State } from './state';

export interface HasComponentList {
  readonly components: ReadonlyArray<State<object>>;
}

export const $componentListId = source<StateId<HasComponentList>|null>(
    'componentListId',
    () => null,
);

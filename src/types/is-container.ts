import {MutableState} from 'gs-tools/export/state';

import {ComponentId} from '../id/component-id';

export interface IsContainer {
  readonly contentIds: MutableState<ReadonlyArray<ComponentId<unknown>>>;
}
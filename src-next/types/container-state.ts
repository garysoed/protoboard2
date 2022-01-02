import {MutableState} from 'gs-tools/export/state';

import {ComponentState} from './component-state';

export interface ContainerState extends ComponentState {
  readonly contentIds: MutableState<ReadonlyArray<{}>>;
}

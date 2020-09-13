import { StateId } from 'gs-tools/export/state';

export interface IsContainer {
  readonly $contentIds: StateId<readonly string[]>;
}

import { StateId } from 'gs-tools/export/state';

import { Coordinate } from '../coordinate/coordinate';

export interface ContentSpec<C extends Coordinate> {
  readonly objectId: string;
  readonly coordinate: C;
}

export interface IsContainer<C extends Coordinate> {
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<C>>>;
}

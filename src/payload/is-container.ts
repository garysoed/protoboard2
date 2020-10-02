import { StateId } from 'gs-tools/export/state';

import { Coordinate } from '../coordinate/coordinate';
import { Indexed } from '../coordinate/indexed';

export interface ContentSpec<C extends Coordinate> {
  readonly objectId: string;
  readonly coordinate: C;
}

interface TypeCoordinateMapping {
  readonly indexed: Indexed;
}

export interface IsContainer<T extends keyof TypeCoordinateMapping> {
  readonly type: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<TypeCoordinateMapping[T]>>>;
}

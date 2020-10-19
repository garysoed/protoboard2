import { StateId } from 'gs-tools/export/state';

import { Coordinate } from '../coordinate/coordinate';
import { Indexed } from '../coordinate/indexed';

export interface ContentSpec<C extends Coordinate> {
  readonly objectId: string;
  readonly coordinate: C;
}

export interface TypeCoordinateMapping {
  readonly indexed: Indexed;
}

export type CoordinateTypes = keyof TypeCoordinateMapping;

export interface IsContainer<T extends CoordinateTypes> {
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<TypeCoordinateMapping[T]>>>;
}

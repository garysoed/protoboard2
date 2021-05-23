import {StateId} from 'gs-tools/export/state';

import {Indexed} from '../coordinate/indexed';


export interface TypeCoordinateMapping {
  readonly indexed: Indexed;
}

export interface ContentSpec<C extends CoordinateTypes> {
  readonly objectId: StateId<unknown>;
  readonly coordinate: TypeCoordinateMapping[C];
}

export type CoordinateTypes = keyof TypeCoordinateMapping;

export interface IsContainer<T extends CoordinateTypes> {
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<T>>>;
}

interface IndexedSpec {
  readonly objectId: StateId<unknown>;
  readonly coordinate: Indexed;
}
export function indexedContentSpec(spec: IndexedSpec): ContentSpec<'indexed'> {
  return spec;
}

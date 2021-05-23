import {StateId} from 'gs-tools/export/state';

import {Indexed} from '../coordinate/indexed';
import {ObjectSpec} from '../types/object-spec';


export interface TypeCoordinateMapping {
  readonly indexed: Indexed;
}

export interface ContentSpec<C extends CoordinateTypes> {
  readonly objectId: StateId<ObjectSpec<any>>;
  readonly coordinate: TypeCoordinateMapping[C];
}

export type CoordinateTypes = keyof TypeCoordinateMapping;

export interface IsContainer<T extends CoordinateTypes> {
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<T>>>;
}

interface IndexedSpec {
  readonly objectId: StateId<ObjectSpec<any>>;
  readonly coordinate: Indexed;
}
export function indexedContentSpec(spec: IndexedSpec): ContentSpec<'indexed'> {
  return spec;
}

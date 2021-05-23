import {StateId} from 'gs-tools/export/state';

import {ContentSpec, CoordinateTypes, IsContainer} from '../payload/is-container';


export interface ContainerSpec<T extends CoordinateTypes> extends IsContainer<T> {
}

interface Input<T extends CoordinateTypes> {
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<T>>>;
}

export function containerSpec<T extends CoordinateTypes>(
    input: Input<T>,
): ContainerSpec<T> {
  return {
    $contentSpecs: input.$contentSpecs,
    containerType: input.containerType,
  };
}

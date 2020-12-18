import {StateId} from 'gs-tools/export/state';

import {ContentSpec, CoordinateTypes, IsContainer} from '../payload/is-container';

import {ObjectClass, ObjectSpec} from './object-spec';


export interface ContainerSpec<P, T extends CoordinateTypes> extends ObjectSpec<IsContainer<T> & P> {
  readonly objectClass: ObjectClass.CONTAINER;
}

interface Input<P, T extends CoordinateTypes> {
  readonly type: string;
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<T>>>;
  readonly payload: P;
}

export function containerSpec<P, T extends CoordinateTypes>(
    input: Input<P, T>,
): ContainerSpec<P, T> {
  return {
    type: input.type,
    objectClass: ObjectClass.CONTAINER,
    payload: {
      ...input.payload,
      $contentSpecs: input.$contentSpecs,
      containerType: input.containerType,
    },
  };
}

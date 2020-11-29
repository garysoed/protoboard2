import {CoordinateTypes, IsContainer} from '../payload/is-container';

import {ObjectClass, ObjectSpec} from './object-spec';

export interface ContainerSpec<T extends CoordinateTypes> extends ObjectSpec<IsContainer<T>> {
  readonly objectClass: ObjectClass.CONTAINER;
}
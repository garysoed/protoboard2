import { CoordinateTypes, IsContainer } from '../../payload/is-container';
import { ContainerSpec } from '../../types/container-spec';
import { ObjectClass } from '../../types/object-spec';
import { PieceSpec } from '../../types/piece-spec';

export function fakeContainerSpec<P extends IsContainer<C>, C extends CoordinateTypes>(
    partial: {readonly type?: string; readonly payload: P},
): ContainerSpec<P, C> {
  return {
    objectClass: ObjectClass.CONTAINER,
    type: 'TEST_TYPE',
    ...partial,
  };
}

export function fakePieceSpec<P>(
    partial: {readonly type?: string; readonly payload: P},
): PieceSpec<P> {
  return {
    objectClass: ObjectClass.PIECE,
    type: 'TEST_TYPE',
    ...partial,
  };
}
import {CoordinateTypes, IsContainer} from '../../payload/is-container';
import {ContainerSpec} from '../../types/container-spec';
import {PieceSpec} from '../../types/piece-spec';

export function fakeContainerSpec<P extends IsContainer<C>, C extends CoordinateTypes>(
    partial: {readonly type?: string; readonly payload: P},
): ContainerSpec<P, C> {
  return {
    type: 'TEST_TYPE',
    ...partial,
  };
}

export function fakePieceSpec<P>(
    partial: {readonly type?: string; readonly payload: P},
): PieceSpec<P> {
  return {
    type: 'TEST_TYPE',
    ...partial,
  };
}
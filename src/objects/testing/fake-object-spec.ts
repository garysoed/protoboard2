import {CoordinateTypes, IsContainer} from '../../payload/is-container';
import {ActiveSpec} from '../../types/active-spec';
import {ContainerSpec} from '../../types/container-spec';
import {ObjectClass, ObjectSpec} from '../../types/object-spec';
import {PieceSpec} from '../../types/piece-spec';

type PartialObject<P> = Partial<ObjectSpec<P>> & {payload: P};

// TODO: Delete
export function fakeObjectSpec<P>(partial: PartialObject<P>): ObjectSpec<P> {
  return {
    objectClass: ObjectClass.PIECE,
    type: 'TEST_TYPE',
    ...partial,
  };
}

export function fakeActiveSpec(
    partial: {readonly type?: string; readonly payload: IsContainer<'indexed'>},
): ActiveSpec {
  return {
    objectClass: ObjectClass.ACTIVE,
    type: 'TEST_TYPE',
    ...partial,
  };
}

export function fakeContainerSpec<C extends CoordinateTypes>(
    partial: {readonly type?: string; readonly payload: IsContainer<C>},
): ContainerSpec<C> {
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
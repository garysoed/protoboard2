import {ObjectClass, ObjectSpec} from '../../types/object-spec';

type PartialObject<P> = Partial<ObjectSpec<P>> & {payload: P};

export function fakeObjectSpec<P>(partial: PartialObject<P>): ObjectSpec<P> {
  return {
    objectClass: ObjectClass.PIECE,
    type: 'TEST_TYPE',
    ...partial,
  };
}

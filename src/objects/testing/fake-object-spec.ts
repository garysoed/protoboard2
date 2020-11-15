import {ObjectSpec} from '../object-spec';

type PartialObject<P> = Partial<ObjectSpec<P>> & {payload: P};

export function fakeObjectSpec<P>(partial: PartialObject<P>): ObjectSpec<P> {
  return {
    id: 'TEST_ID',
    type: 'TEST_TYPE',
    ...partial,
  };
}

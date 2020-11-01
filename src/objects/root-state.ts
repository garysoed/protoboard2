import { ObjectSpec } from './object-spec';

export interface RootState {
  readonly objectSpecs: ReadonlyArray<ObjectSpec<any>>;
}

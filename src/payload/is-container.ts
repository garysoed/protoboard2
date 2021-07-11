import {MutableState, ObjectPath} from 'gs-tools/export/state';


export interface IsContainer {
  readonly contentsId: MutableState<ReadonlyArray<ObjectPath<unknown>>>;
}

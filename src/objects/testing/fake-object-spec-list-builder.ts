import { StateId } from 'gs-tools/export/state';
import { of as observableOf } from 'rxjs';

import { ObjectSpec } from '../object-spec';
import { HasObjectSpecList } from '../object-spec-list';

type PartialObjectSpec<T> = Partial<ObjectSpec<T>> & {readonly id: string; readonly payload: T};

class ObjectSpecListBuilder {
  private readonly specs: Array<ObjectSpec<any>> = [...this.baseObjectSpecs];

  constructor(private readonly baseObjectSpecs: ReadonlyArray<ObjectSpec<any>>) { }

  add<T>(partial: PartialObjectSpec<T>): ObjectSpec<T> {
    const spec = {
      createSpec: () => observableOf(document.createElement('div')),
      ...partial,
    };
    this.specs.push(spec);

    return spec;
  }

  build(): HasObjectSpecList {
    return {objectSpecs: [...this.specs]};
  }
}


export function fakeObjectSpecListBuilder(
    baseHasObjectSpecList: HasObjectSpecList = {objectSpecs: []},
): ObjectSpecListBuilder {
  return new ObjectSpecListBuilder(baseHasObjectSpecList.objectSpecs);
}

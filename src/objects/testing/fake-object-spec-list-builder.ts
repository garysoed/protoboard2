import { Vine } from 'grapevine';
import { StateId, StateService } from 'gs-tools/export/state';
import { setId } from 'persona';
import { of as observableOf } from 'rxjs';

import { ObjectCreateSpec } from '../object-create-spec';
import { $createSpecMap } from '../object-service';
import { ObjectSpec } from '../object-spec';
import { $objectSpecListId, HasObjectSpecList } from '../object-spec-list';


type PartialObjectSpec<T> = Partial<ObjectSpec<T>> & {readonly id: string; readonly payload: T};

interface State {
  readonly objectSpecList: HasObjectSpecList;
  readonly $rootId: StateId<HasObjectSpecList>;
}

class ObjectSpecListBuilder {
  private readonly specs: Array<ObjectSpec<any>> = [...this.baseObjectSpecs];
  private readonly createSpecMap = new Map<string, ObjectCreateSpec<any>>();

  constructor(private readonly baseObjectSpecs: ReadonlyArray<ObjectSpec<any>>) { }

  add<T>(
      partial: PartialObjectSpec<T>,
      createFn: ObjectCreateSpec<T> = () => observableOf(setId(document.createElement('div'), {})),
  ): ObjectSpec<T> {
    const spec = {
      type: partial.id,
      ...partial,
    };
    this.specs.push(spec);
    this.createSpecMap.set(spec.type, createFn);

    return spec;
  }

  build(stateService: StateService, vine: Vine): State {
    const objectSpecList = {objectSpecs: [...this.specs]};
    const $rootId = stateService.add<HasObjectSpecList>(objectSpecList);
    $objectSpecListId.set(vine, () => $rootId);
    $createSpecMap.set(vine, existing => new Map([...existing, ...this.createSpecMap]));
    return {$rootId, objectSpecList};
  }
}


export function fakeObjectSpecListBuilder(
    baseHasObjectSpecList: HasObjectSpecList = {objectSpecs: []},
): ObjectSpecListBuilder {
  return new ObjectSpecListBuilder(baseHasObjectSpecList.objectSpecs);
}

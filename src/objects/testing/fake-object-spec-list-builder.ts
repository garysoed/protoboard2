import { StateId, StateService } from 'gs-tools/export/state';
import { Vine } from 'grapevine';
import { of as observableOf } from 'rxjs';
import { setId } from 'persona';

import { $createSpecMap } from '../object-service';
import { $rootState } from '../root-state-service';
import { ObjectCreateSpec } from '../object-create-spec';
import { ObjectSpec } from '../object-spec';
import { RootState } from '../root-state';


type PartialObjectSpec<T> = Partial<ObjectSpec<T>> & {readonly id: string; readonly payload: T};

interface State {
  readonly objectSpecList: RootState;
  readonly $rootId: StateId<RootState>;
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
    const $rootId = stateService.add<RootState>(objectSpecList);
    $rootState.set(vine, () => $rootId);
    $createSpecMap.set(vine, existing => new Map([...existing, ...this.createSpecMap]));
    return {$rootId, objectSpecList};
  }
}


export function fakeObjectSpecListBuilder(
    baseHasObjectSpecList: RootState = {objectSpecs: []},
): ObjectSpecListBuilder {
  return new ObjectSpecListBuilder(baseHasObjectSpecList.objectSpecs);
}

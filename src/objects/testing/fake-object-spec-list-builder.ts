import {Vine} from 'grapevine';
import {StateId, StateService} from 'gs-tools/export/state';
import {setId} from 'persona';
import {of as observableOf} from 'rxjs';

import {ActivePayload, ACTIVE_TYPE} from '../../core/active';
import {CoordinateTypes, IsContainer} from '../../payload/is-container';
import {ObjectSpec} from '../../types/object-spec';
import {ObjectCreateSpec} from '../object-create-spec';
import {$createSpecMap} from '../object-service';
import {$$rootState, RootState} from '../root-state';


type PartialObjectSpec<T> = Partial<ObjectSpec<T>> & {readonly id: string; readonly payload: T};

interface State {
  readonly $rootId: StateId<RootState>;
  readonly rootState: RootState;
}

interface Config {
  readonly activePayload?: ActivePayload;
  readonly objectSpecs?: ReadonlyArray<ObjectSpec<any>>;
}

export class FakeRootStateBuilder {
  private activePayload = this.config.activePayload ?? null;
  private readonly containerSpecs: Array<ObjectSpec<IsContainer<any>>> = [];
  private readonly specs: Array<ObjectSpec<any>> = [...(this.config.objectSpecs ?? [])];
  private readonly createSpecMap = new Map<string, ObjectCreateSpec<any>>();

  constructor(
      private readonly config: Config,
  ) { }

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

  addContainer<C extends CoordinateTypes>(
      partial: PartialObjectSpec<IsContainer<C>>,
      createFn: ObjectCreateSpec<IsContainer<C>> = () => observableOf(setId(document.createElement('div'), {})),
  ): ObjectSpec<IsContainer<C>> {
    const spec = this.add<IsContainer<C>>(partial, createFn);
    this.containerSpecs.push(spec);
    return spec;
  }

  build(stateService: StateService, vine: Vine): State {
    const rootState = {
      $activeId: stateService.add<ObjectSpec<ActivePayload>>({
        type: ACTIVE_TYPE,
        payload: this.activePayload ?? {
          containerType: 'indexed',
          $contentSpecs: stateService.add([]),
        },
      }),
      containerIds: [...this.containerSpecs].map(spec => stateService.add(spec)),
      objectSpecIds: [...this.specs].map(spec => stateService.add(spec)),
    };
    const $rootId = stateService.add<RootState>(rootState);
    $$rootState.set(vine, () => $rootId);
    $createSpecMap.set(vine, existing => new Map([...existing, ...this.createSpecMap]));
    return {$rootId, rootState};
  }

  setActivePayload(payload: ActivePayload): this {
    this.activePayload = payload;
    return this;
  }
}

import {Vine} from 'grapevine';
import {StateId, StateService} from 'gs-tools/export/state';
import {setId} from 'persona';
import {of as observableOf} from 'rxjs';

import {ACTIVE_TYPE} from '../../core/active';
import {CoordinateTypes} from '../../payload/is-container';
import {ActiveSpec} from '../../types/active-spec';
import {ContainerSpec} from '../../types/container-spec';
import {ObjectClass, ObjectSpec} from '../../types/object-spec';
import {ObjectCreateSpec} from '../object-create-spec';
import {$createSpecMap} from '../object-service';
import {$$rootState, RootState} from '../root-state';


type PartialObjectSpec<O extends ObjectSpec<any>> = Partial<O> & {readonly payload: object};

interface State {
  readonly $rootId: StateId<RootState>;
  readonly rootState: RootState;
}

interface Config {
  readonly activePayload?: ActiveSpec;
  readonly objectSpecs?: ReadonlyArray<ObjectSpec<any>>;
}

// TODO: Delete this.
export class FakeRootStateBuilder {
  private activePayload = this.config.activePayload ?? null;
  private readonly containerSpecs: Array<ContainerSpec<any>> = [];
  private readonly specs: Array<ObjectSpec<any>> = [...(this.config.objectSpecs ?? [])];
  private readonly createSpecMap = new Map<string, ObjectCreateSpec<any>>();

  constructor(
      private readonly config: Config,
  ) { }

  add<T extends ObjectSpec<any>>(
      partial: PartialObjectSpec<T>,
      createFn: ObjectCreateSpec<T> = () => observableOf(setId(document.createElement('div'), {})),
  ): T {
    const spec = {
      objectClass: ObjectClass.PIECE,
      type: 'TEST',
      ...partial,
    };
    this.specs.push(spec);
    this.createSpecMap.set(spec.type, createFn);

    return spec as T;
  }

  addContainer<C extends CoordinateTypes>(
      partial: PartialObjectSpec<ContainerSpec<C>>,
      createFn: ObjectCreateSpec<ContainerSpec<C>> = () => observableOf(setId(document.createElement('div'), {})),
  ): ContainerSpec<C> {
    const spec = this.add<ContainerSpec<C>>(partial, createFn);
    this.containerSpecs.push(spec);
    return spec;
  }

  build(stateService: StateService, vine: Vine): State {
    const rootState = {
      $activeId: stateService.add<ActiveSpec>({
        objectClass: ObjectClass.ACTIVE,
        type: ACTIVE_TYPE,
        payload: this.activePayload?.payload ?? {
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

  setActivePayload(payload: ActiveSpec): this {
    this.activePayload = payload;
    return this;
  }
}

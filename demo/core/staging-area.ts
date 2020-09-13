import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $button, $lineLayout, $stateService, _p, Button, LineLayout, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../../src/action/payload/is-container';
import { OrientablePayload } from '../../src/action/payload/orientable-payload';
import { RotatablePayload } from '../../src/action/payload/rotatable-payload';
import { ObjectSpec } from '../../src/objects/object-spec';
import { $objectSpecListId, HasObjectSpecList } from '../../src/objects/object-spec-list';
import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE } from '../../src/region/supply';

import { PieceSpec } from './piece-spec';
import template from './staging-area.html';
import { $stagingService } from './staging-service';


export interface GenericPiecePayload extends
    PieceSpec, OrientablePayload, RotatablePayload, IsContainer {
}

export const ROOT_SLOT_PREFIX = 'pbd.root-slot';
export const ROOT_SLOT_TYPE = 'pbd.root-slot';

export const $stagingArea = {
  tag: 'pbd-staging-area',
  api: {},
};

const $ = {
  list: element('list', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
  startButton: element('startButton', $button, {}),
};

@_p.customElement({
  ...$stagingArea,
  dependencies: [
    Button,
    LineLayout,
  ],
  template,
})
export class StagingArea extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.list._.content, this.contentNodes$);
    this.addSetup(this.handleStartAction$);
  }

  @cache()
  private get contentNodes$(): Observable<readonly Node[]> {
    return $stagingService.get(this.vine).pipe(
        switchMap(service => service.states$),
        switchMap(states => {
          const node$List = $pipe(
              states,
              $map(state => {
                const payload = (state as ObjectSpec<GenericPiecePayload>).payload;
                const label = `${payload.componentTag.substr(3)}: ${payload.icons.join(', ')}`;

                return renderCustomElement(
                    $lineLayout,
                    {textContent: observableOf(label)},
                    this.context,
                );
              }),
              $asArray(),
          );

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }

  @cache()
  private get handleStartAction$(): Observable<unknown> {
    return this.declareInput($.startButton._.actionEvent).pipe(
        withLatestFrom($stagingService.get(this.vine)),
        switchMap(([, stagingService]) => {
          return stagingService.states$.pipe(
              take(1),
              withLatestFrom($stateService.get(this.vine)),
              tap(([specs, stateService]) => {
                stateService.clear();

                // Add the root slot specs.
                const rootSlotObjectSpecs: Array<ObjectSpec<IsContainer>> = [];
                for (let i = 0; i < 9; i++) {
                  const $contentIds = stateService.add<readonly string[]>([]);
                  rootSlotObjectSpecs.push({
                    id: `${ROOT_SLOT_PREFIX}${i}`,
                    type: ROOT_SLOT_TYPE,
                    payload: {$contentIds},
                  });
                }

                // Add the supply specs.
                const $supplyContentIds = stateService.add<readonly string[]>($pipe(
                    specs,
                    $map(({id}) => id),
                    $asArray(),
                ));
                const supplyObjectSpec: ObjectSpec<IsContainer> = {
                  id: SUPPLY_ID,
                  type: SUPPLY_TYPE,
                  payload: {$contentIds: $supplyContentIds},
                };

                // Add the active specs.
                const $activeContentIds = stateService.add<readonly string[]>([]);
                const activeObjectSpec: ObjectSpec<IsContainer> = {
                  id: ACTIVE_ID,
                  type: ACTIVE_TYPE,
                  payload: {$contentIds: $activeContentIds},
                };

                // User defined object specs.
                // TODO: DO NOT USE THE ANY
                const userDefinedObjectSpecs: Array<ObjectSpec<GenericPiecePayload>> = [];
                for (const spec of specs) {
                  const $contentIds = stateService.add<readonly string[]>([]);
                  const payload: GenericPiecePayload = {
                    ...spec.payload,
                    faceIndex: 0,
                    rotationIndex: 0,
                    $contentIds,
                  };
                  userDefinedObjectSpecs.push({...spec, payload});
                }

                const root: HasObjectSpecList = {
                  objectSpecs: [
                    ...rootSlotObjectSpecs,
                    supplyObjectSpec,
                    activeObjectSpec,
                  ],
                };
                const rootId = stateService.add(root);
                $objectSpecListId.set(this.vine, () => rootId);
                stagingService.setStaging(false);
              }),
          );
        }),
    );
  }
}

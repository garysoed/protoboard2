import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $button, $lineLayout, $rootId, $stateService, _p, Button, LineLayout, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../../src/action/payload/is-container';
import { IsMultifaced } from '../../src/action/payload/is-multifaced';
import { IsRotatable } from '../../src/action/payload/is-rotatable';
import { ObjectSpec } from '../../src/objects/object-spec';
import { $objectSpecListId, HasObjectSpecList } from '../../src/objects/object-spec-list';
import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';

import { PREVIEW_TYPE, ROOT_SLOT_TYPE, SUPPLY_TYPE } from './object-specs';
import { PieceSpec } from './piece-spec';
import template from './staging-area.html';
import { $stagingService } from './staging-service';
import { SUPPLY_ID } from './supply';


export interface GenericPiecePayload extends
    PieceSpec, IsMultifaced, IsRotatable, IsContainer {
}

export const ROOT_SLOT_PREFIX = 'pbd.root-slot';

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
        switchMap(service => service.pieceSpecs$),
        switchMap(states => {
          const node$List = $pipe(
              states,
              $map(spec => {
                const label = `${spec.componentTag.substr(3)}: ${spec.icons.join(', ')}`;

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
          return stagingService.pieceSpecs$.pipe(
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
                const userDefinedObjectSpecs: Array<ObjectSpec<any>> = [];
                for (const spec of specs) {
                  const $contentIds = stateService.add<readonly string[]>([]);
                  const $currentFaceIndex = stateService.add<number>(0);
                  const $rotationDeg = stateService.add<number>(0);
                  const payload: GenericPiecePayload = {
                    ...spec,
                    $currentFaceIndex,
                    $rotationDeg,
                    $contentIds,
                  };
                  userDefinedObjectSpecs.push({...spec, type: PREVIEW_TYPE, payload});
                }

                const root: HasObjectSpecList = {
                  objectSpecs: [
                    ...rootSlotObjectSpecs,
                    supplyObjectSpec,
                    activeObjectSpec,
                    ...userDefinedObjectSpecs,
                  ],
                };
                const rootId = stateService.add(root);
                $rootId.set(this.vine, () => rootId);
                $objectSpecListId.set(this.vine, () => rootId);
                stagingService.setStaging(false);
              }),
          );
        }),
    );
  }
}


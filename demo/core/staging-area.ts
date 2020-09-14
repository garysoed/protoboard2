import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $button, $icon, $lineLayout, $stateService, _p, Button, LineLayout, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement, renderElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../../src/action/payload/is-container';
import { OrientablePayload } from '../../src/action/payload/orientable-payload';
import { RotatablePayload } from '../../src/action/payload/rotatable-payload';
import { $baseComponent } from '../../src/core/base-component';
import { ObjectSpec } from '../../src/objects/object-spec';
import { $objectSpecListId, HasObjectSpecList } from '../../src/objects/object-spec-list';
import { ACTIVE_ID, renderActive } from '../../src/region/active';
import { $slot } from '../../src/region/slot';

import { PieceSpec } from './piece-spec';
import template from './staging-area.html';
import { $stagingService } from './staging-service';
import { SUPPLY_ID } from './supply';


export interface GenericPiecePayload extends
    PieceSpec, OrientablePayload, RotatablePayload, IsContainer {
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
                    createSpec: renderRootSlot,
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
                  createSpec: renderSupply,
                  payload: {$contentIds: $supplyContentIds},
                };

                // Add the active specs.
                const $activeContentIds = stateService.add<readonly string[]>([]);
                const activeObjectSpec: ObjectSpec<IsContainer> = {
                  id: ACTIVE_ID,
                  createSpec: renderActive,
                  payload: {$contentIds: $activeContentIds},
                };

                // User defined object specs.
                const userDefinedObjectSpecs: Array<ObjectSpec<any>> = [];
                for (const spec of specs) {
                  const $contentIds = stateService.add<readonly string[]>([]);
                  const payload: GenericPiecePayload = {
                    ...spec,
                    faceIndex: 0,
                    rotationIndex: 0,
                    $contentIds,
                  };
                  userDefinedObjectSpecs.push({...spec, createSpec: renderDemoPreview, payload});
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
                $objectSpecListId.set(this.vine, () => rootId);
                stagingService.setStaging(false);
              }),
          );
        }),
    );
  }
}


function renderRootSlot(spec: ObjectSpec<IsContainer>, context: PersonaContext): Observable<Node> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(spec.id)}},
      context,
  );
}

function renderSupply(spec: ObjectSpec<IsContainer>, context: PersonaContext): Observable<Node> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(spec.id)}},
      context,
  );
}

function renderDemoPreview(
    state: ObjectSpec<GenericPiecePayload>,
    context: PersonaContext,
): Observable<Node> {
  const icon$list = state.payload.icons.map((icon, index) => renderCustomElement(
      $icon,
      {
        inputs: {icon: observableOf(icon)},
        attrs: new Map([
          ['slot', observableOf(`face-${index}`)],
        ]),
      },
      context,
  ));

  return renderElement(
      state.payload.componentTag,
      {
        children: icon$list.length <= 0 ? observableOf([]) : combineLatest(icon$list),
        attrs: new Map([
          [$baseComponent.api.objectId.attrName, observableOf(state.id)],
        ]),
      },
      context,
  );
}

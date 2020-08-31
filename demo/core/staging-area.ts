import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $iconWithText, $textIconButton, _p, IconWithText, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE } from '../../src/region/supply';
import { SavedState } from '../../src/state/saved-state';
import { $stateService } from '../../src/state/state-service';

import template from './staging-area.html';
import { $stagingService, GenericPiecePayload } from './staging-service';


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
  startButton: element('startButton', $textIconButton, {}),
};

@_p.customElement({
  ...$stagingArea,
  dependencies: [
    IconWithText,
    TextIconButton,
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
                const payload = (state as SavedState<GenericPiecePayload>).payload;
                const label = `${payload.componentTag.substr(3)}: ${payload.icons.join(', ')}`;

                return renderCustomElement(
                    $iconWithText,
                    {inputs: {label: observableOf(label)}},
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
              tap(([states, stateService]) => {
                const rootSlots = [];
                for (let i = 0; i < 9; i++) {
                  rootSlots.push({
                    id: `${ROOT_SLOT_PREFIX}${i}`,
                    type: ROOT_SLOT_TYPE,
                    payload: {contentIds: []},
                  });
                }

                const supplyContentIds = $pipe(
                    states,
                    $map(({id}) => id),
                    $asArray(),
                );

                stateService.setStates(new Set([
                  ...rootSlots,
                  ...states,
                  {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {contentIds: []}},
                  {id: SUPPLY_ID, type: SUPPLY_TYPE, payload: {contentIds: supplyContentIds}},
                ]));
                stagingService.setStaging(false);
              }),
          );
        }),
    );
  }
}

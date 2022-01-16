import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, icall, id, itarget, ivalue, ostyle, registerCustomElement, SLOT} from 'persona';
import {Observable} from 'rxjs';

import {pickAction} from '../action/pick-action';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {renderRotatable} from '../render/render-rotatable';
import {ComponentState} from '../types/component-state';
import {IsRotatable} from '../types/is-rotatable';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './d1.html';


export interface D1State extends ComponentState, IsRotatable {}

/**
 * The D1's API.
 *
 * @thModule piece
 */
const $d1 = {
  host: {
    ...create$baseComponent<D1State>().host,
    pick: icall('pick', undefinedType),
    pickConfig: ivalue('pickConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK}),
    // rotateAction: rotateActionConfigSpecs({}),
  },
  shadow: {
    container: id('container', SLOT, {
      target: itarget(),
      transform: ostyle('transform'),
    }),
    // slot: id('slot', SLOT, {
    // slotted: islotted(),
    // }),
  },
};

export function d1State(id: {}, partial: Partial<D1State> = {}): D1State {
  return {
    id,
    rotationDeg: mutableState(0),
    ...partial,
  };
}

class D1Ctrl extends BaseComponent<D1State> {
  /**
   * @internal
   */
  constructor(private readonly $: Context<typeof $d1>) {
    super($);
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.installAction(
          pickAction,
          undefined,
          this.$.shadow.container.target,
          this.$.host.pickConfig,
          this.$.host.pick,
      ),
      this.state.$('rotationDeg').pipe(
          renderRotatable(),
          this.$.shadow.container.transform(),
      ),
    ];
  }

  // @cache()
  // protected get actions(): readonly ActionSpec[] {
  //   return [
  // this.createActionSpec(
  //     rotateAction,
  //     compileConfig($.host._.rotateAction, this.context),
  //     'Rotate',
  // ),
  // ];
  // }
}

export const D1 = registerCustomElement({
  ctrl: D1Ctrl,
  spec: $d1,
  tag: 'pb-d1',
  template,
});
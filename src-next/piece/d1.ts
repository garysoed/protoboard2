import {Context, registerCustomElement} from 'persona';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {ComponentState} from '../types/component-state';

import template from './d1.html';


export interface D1State extends ComponentState {}

/**
 * The D1's API.
 *
 * @thModule piece
 */
const $d1 = {
  host: {
    ...create$baseComponent<D1State>().host,
    // pickAction: pickActionConfigSpecs({}),
    // rotateAction: rotateActionConfigSpecs({}),
  },
  shadow: {
    // slot: id('slot', SLOT, {
    // slotted: islotted(),
    // }),
  },
};

export function d1State(id: {}, partial: Partial<D1State>): D1State {
  return {
    id,
    // rotationDeg: mutableState(0),
    ...partial,
  };
}

class D1Ctrl extends BaseComponent<D1State> {
  /**
   * @internal
   */
  constructor(private readonly $: Context<typeof $d1>) {
    super($);

    // this.addSetup(renderRotatable(this.objectSpec$, this.inputs.slot.slotted, $));
  }

  // @cache()
  // protected get actions(): readonly ActionSpec[] {
  //   return [
  // this.createActionSpec(
  //     rotateAction,
  //     compileConfig($.host._.rotateAction, this.context),
  //     'Rotate',
  // ),
  // this.createActionSpec(
  //     pickAction,
  //     compileConfig($.host._.pickAction, this.context),
  //     'Pick',
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
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, id, omulti, registerCustomElement, RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';

import {create$baseComponent} from '../core/base-component';
import {BaseRegion} from '../core/base-region';
import {D1State} from '../piece/d1';
import {RegionState} from '../types/region-state';

import template from './slot.html';


export interface SlotState extends RegionState {}

const $slot = {
  host: {
    ...create$baseComponent<SlotState>().host,
    // dropAction: dropActionConfigSpecs({}),
  },
  shadow: {
    root: id('root', DIV, {
      content: omulti('#content'),
    }),
  },
};


export function slotState(id: {}, input: Partial<D1State>): SlotState {
  return {
    id,
    contentIds: mutableState([]),
    ...input,
  };
}


export class Slot extends BaseRegion<SlotState> {
  constructor(private readonly $: Context<typeof $slot>) {
    super($);
  }

  // @cache()
  // protected get actions(): readonly ActionSpec[] {
  //   return [
  //     this.createActionSpec(dropAction, compileConfig($.host._.dropAction, this.context), 'Drop'),
  //   ];
  // }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return this.$.shadow.root.content();
  }
}

export const SLOT = registerCustomElement({
  ctrl: Slot,
  spec: $slot,
  tag: 'pb-slot',
  template,
});
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, id, itarget, omulti, registerCustomElement, RenderSpec} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';

import {BaseRegion, create$baseRegion} from '../core/base-region';
import {RegionState} from '../types/region-state';

import template from './slot.html';


export interface SlotState extends RegionState {}

const $slot = {
  host: {
    ...create$baseRegion<SlotState>().host,
  },
  shadow: {
    root: id('root', DIV, {
      content: omulti('#content'),
      target: itarget(),
    }),
  },
};


export function slotState(id: {}, input: Partial<SlotState> = {}): SlotState {
  return {
    id,
    contentIds: mutableState([]),
    ...input,
  };
}


export class Slot extends BaseRegion<SlotState> {
  constructor(private readonly $: Context<typeof $slot>) {
    super($, 'Slot');
  }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return this.$.shadow.root.content();
  }

  @cache()
  protected get target$(): Observable<HTMLElement> {
    return this.$.shadow.root.target;
  }
}

export const SLOT = registerCustomElement({
  ctrl: Slot,
  spec: $slot,
  tag: 'pb-slot',
  template,
});
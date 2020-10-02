import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext, setAttribute } from 'persona';
import { of as observableOf } from 'rxjs';

import { PickAction } from '../../export';
import { DropAction } from '../action/drop-action';
import { Indexed } from '../coordinate/indexed';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerType } from '../core/trigger-spec';
import { IsContainer } from '../payload/is-container';
import { renderContents } from '../render/render-contents';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseComponent.api,
  },
};

export const $ = {
  host: host({
    ...$slot.api,
    action: setAttribute('mk-action-2'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

export type SlotPayload = IsContainer<Indexed>;

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotPayload> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.CLICK, provider: context => new PickAction(context, {location: 0})},
          {trigger: TriggerType.D, provider: context => new DropAction(context, {location: 0})},
        ],
        context,
    );

    this.addSetup(renderContents(this.objectPayload$, $.root._.content, context));
    this.render($.host._.action, observableOf(true));
  }
}

import {instanceofType} from 'gs-types';
import {_p} from 'mask';
import {PersonaContext, element, host, multi} from 'persona';

import {DropAction} from '../action/drop-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

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
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

export type SlotPayload = IsContainer<'indexed'>;

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotPayload> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
        ],
        context,
    );

    this.addSetup(renderContents(this.objectPayload$, $.root._.content, context));
  }
}

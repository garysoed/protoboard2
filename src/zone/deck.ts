import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, PersonaContext } from 'persona';

import { BaseAction } from '../core/base-action';
import { BaseActionCtor, BaseComponent } from '../core/base-component';
import { UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './deck.html';


export const $deck = {
  tag: 'pb-deck',
  api: {},
};

const $ = {
  host: host({}),
  target: element('target', instanceofType(HTMLDivElement), {}),
};

interface DeckPayload { }

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckPayload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<DeckPayload, any>>([
          // [
          //   TriggerSpec.F,
          //   new SequenceAction(
          //       'flip',
          //       'Flip deck',
          //       [
          //         new BatchAction(FLIP_ACTION_KEY, 'Batch flip', context.vine),
          //         new ReverseAction(context.vine),
          //       ],
          //       context.vine,
          //   ),
          // ],
          // [TriggerSpec.D, new DropAction($.host.getValue(context), context.vine)],
          // [TriggerSpec.S, new ShuffleAction(context.vine)],
        ]),
        context,
        $.target,
    );
  }
}

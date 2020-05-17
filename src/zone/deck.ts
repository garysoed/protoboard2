import { _p } from 'mask';
import { host, PersonaContext } from 'persona';

import { DropAction } from '../action/drop-action';
import { KEY as FLIP_ACTION_KEY } from '../action/flip-action';
import { ReverseAction } from '../action/reverse-action';
import { ShuffleAction } from '../action/shuffle-action';
import { BatchAction } from '../action/util/batch-action';
import { SequenceAction } from '../action/util/sequence-action';
import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './deck.html';


const $ = {
  host: host({}),
};

@_p.customElement({
  tag: 'pb-deck',
  template,
  api: {},
})
export class Deck extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          [
            TriggerSpec.F,
            new SequenceAction(
                'flip',
                'Flip deck',
                [
                  new BatchAction(FLIP_ACTION_KEY, 'Batch flip', context.vine),
                  new ReverseAction(context.vine),
                ],
                context.vine,
            ),
          ],
          [TriggerSpec.D, new DropAction($.host.getValue(context), context.vine)],
          [TriggerSpec.S, new ShuffleAction(context.vine)],
        ]),
        context,
    );
  }
}

import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, Harness, HarnessCtor} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {DECK} from '../deck';


export class DeckHarness extends CustomElementHarness<typeof DECK> {
  static readonly validType = customElementType(DECK);

  private readonly harness = getHarness(this.target, '#root', TriggerElementHarness);

  getContent<E extends Element, H extends Harness<E>>(harness: HarnessCtor<E, H>): H {
    return getHarness(this.target, '#root :nth-child(1)', harness);
  }

  simulateDrop(): void {
    this.target.drop(undefined);
  }

  simulateHelp(): void {
    this.simulateTrigger(TriggerType.QUESTION);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }
}
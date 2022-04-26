import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, Harness, HarnessCtor} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {SLOT} from '../slot';


export class SlotHarness extends CustomElementHarness<typeof SLOT> {
  static readonly validType = customElementType(SLOT);

  private readonly harness = getHarness(this.target, '#root', TriggerElementHarness);

  getContent< E extends Element, H extends Harness<E>>(
      childSelector: string,
      harness: HarnessCtor<E, H>,
  ): H {
    return getHarness(this.target, `#root ${childSelector}`, harness);
  }

  simulateDrop(): void {
    this.target.drop();
  }

  simulateHelp(): void {
    this.simulateTrigger(TriggerType.QUESTION);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }
}
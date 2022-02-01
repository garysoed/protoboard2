import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {SLOT} from '../slot';


export class SlotHarness extends CustomElementHarness<typeof SLOT> {
  static readonly validType = customElementType(SLOT);

  private readonly harness = getHarness(this.target, '#root', TriggerElementHarness);

  simulateHelp(): void {
    this.simulateTrigger(TriggerType.QUESTION);
  }

  simulateDrop(): void {
    this.target.drop(undefined);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }
}
import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {PAD, StampGenericActionInput} from '../pad';

export class PadHarness extends CustomElementHarness<typeof PAD> {
  static readonly validType = customElementType(PAD);

  private readonly harness = getHarness(this.target, '#root', TriggerElementHarness);

  simulateStamp(input: StampGenericActionInput): void {
    this.target.stamp(input);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    this.harness.simulateTrigger(triggerType, options);
  }
}
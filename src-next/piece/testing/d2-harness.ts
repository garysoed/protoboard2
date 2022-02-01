import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {D2} from '../d2';


export class D2Harness extends CustomElementHarness<typeof D2> {
  static readonly validType = customElementType(D2);

  private readonly harness = getHarness(this.target, '#container', TriggerElementHarness);

  simulateFlip(): void {
    this.target.flip(undefined);
  }

  simulateHelp(): void {
    this.simulateTrigger(TriggerType.QUESTION);
  }

  simulatePick(): void {
    this.target.pick(undefined);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }
}
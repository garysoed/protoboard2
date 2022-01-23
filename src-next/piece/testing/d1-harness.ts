import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {D1} from '../d1';


export class D1Harness extends CustomElementHarness<typeof D1> {
  static readonly validType = customElementType(D1);

  private readonly harness = getHarness(this.target, '#container', TriggerElementHarness);

  simulatePick(): void {
    this.target.pick(undefined);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }
}
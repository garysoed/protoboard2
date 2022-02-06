import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {D6} from '../d6';


export class D6Harness extends CustomElementHarness<typeof D6> {
  static readonly validType = customElementType(D6);

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

  simulateRoll(): void {
    this.target.roll(undefined);
  }

  simulateTrigger(triggerType: TriggerType, options?: MouseEventInit & KeyboardEventInit): void {
    return this.harness.simulateTrigger(triggerType, options);
  }

  simulateTurn(): void {
    this.target.turn(undefined);
  }
}
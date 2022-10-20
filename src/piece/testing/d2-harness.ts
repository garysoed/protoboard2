import {customElementType} from 'persona';
import {CustomElementHarness, getHarness} from 'persona/export/testing';

import {LENS} from '../../face/lens';
import {LensHarness} from '../../face/testing/lens-harness';
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

  simulateHover(): void {
    getHarness(this.target, LENS.tag, LensHarness).simulateHover();
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
}
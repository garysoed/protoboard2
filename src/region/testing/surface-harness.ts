import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, Harness, HarnessCtor} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {SURFACE} from '../surface';


export class SurfaceHarness extends CustomElementHarness<typeof SURFACE> {
  static readonly validType = customElementType(SURFACE);

  private readonly harness = getHarness(this.target, '#root', TriggerElementHarness);

  getContent<E extends Element, H extends Harness<E>>(
      index: number,
      harness: HarnessCtor<E, H>,
  ): H {
    return getHarness(this.target, `#root :nth-child(${index + 1})`, harness);
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
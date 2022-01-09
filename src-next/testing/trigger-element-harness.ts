import {instanceofType} from 'gs-types';
import {ElementHarness, windowHarness} from 'persona/export/testing';

import {TriggerType} from '../types/trigger-spec';

export class TriggerElementHarness extends ElementHarness<Element> {
  static readonly validType = instanceofType(Element);

  simulateTrigger(triggerType: TriggerType, options: MouseEventInit&KeyboardEventInit = {}): void {
    if (triggerType === TriggerType.CLICK) {
      this.simulateClick();
      return;
    }

    this.simulateMouseOver();
    this.simulateMouseMove(options);
    windowHarness.simulateKeydown(triggerType, options);
  }
}
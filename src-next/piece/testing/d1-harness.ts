import {elementWithTagType} from 'gs-types';
import {ElementHarness, getHarness} from 'persona/export/testing';

import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {TriggerType} from '../../types/trigger-spec';
import {D1} from '../d1';


export class D1Harness extends ElementHarness<HTMLElement> {
  static readonly validType = elementWithTagType(D1.tag);

  private readonly innerHarness = getHarness(this.target, '#container', TriggerElementHarness);

  simulateTrigger(triggerType: TriggerType, options: MouseEventInit&KeyboardEventInit = {}): void {
    this.innerHarness.simulateTrigger(triggerType, options);
  }
}
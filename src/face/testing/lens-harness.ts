import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {LENS} from '../lens';

export class LensHarness extends CustomElementHarness<typeof LENS> {
  static readonly validType = customElementType(LENS);

  simulateHover(event?: MouseEventInit): void {
    getHarness(this.target, ElementHarness).simulateMouseOver(event);
  }
}
import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {HELP_OVERLAY} from '../help-overlay';


export class HelpOverlayHarness extends CustomElementHarness<typeof HELP_OVERLAY> {
  static validType = customElementType(HELP_OVERLAY);

  private readonly root = getHarness(this.target, '#root', ElementHarness);

  simulateClick(): void {
    this.root.simulateClick();
  }
}
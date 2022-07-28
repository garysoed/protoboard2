import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness, setupTest} from 'persona/export/testing';

import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import goldens from './goldens/goldens.json';
import {HELP_OVERLAY} from './help-overlay';
import {HelpContent, ShowHelpEvent} from './show-help-event';
import {HelpOverlayHarness} from './testing/help-overlay-harness';


const ACTION_NAME = 'Action Name';

function triggerHelp(contents: readonly HelpContent[]): void {
  const event = new ShowHelpEvent(contents);
  window.dispatchEvent(event);
}

test('@protoboard2/action/help-overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));

    const tester = setupTest({roots: [HELP_OVERLAY], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  test('render', () => {
    should('not add the isVisible class if there are no actions in the help service', () => {
      const overlay = _.tester.bootstrapElement(HELP_OVERLAY);
      triggerHelp([]);

      assert(overlay).to.matchSnapshot('help-overlay__render-empty.html');
    });

    should('add the isVisible class if there is an action in the help service', () => {
      const overlay = _.tester.bootstrapElement(HELP_OVERLAY);
      triggerHelp([
        {
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
          componentName: 'Component 1',
        },
        {
          actions: [
            {trigger: {type: TriggerType.D, shift: true, ctrl: true}, actionName: ACTION_NAME},
          ],
          componentName: 'Component 2',
        },
      ]);

      assert(overlay).to.matchSnapshot('help-overlay__render-filled.html');
    });

    should('render deletion correctly', () => {
      const overlay = _.tester.bootstrapElement(HELP_OVERLAY);
      triggerHelp([
        {
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
          componentName: 'Component',
        },
      ]);
      triggerHelp([]);

      assert(overlay).to.matchSnapshot('help-overlay__deleted.html');
    });
  });

  test('setupHandleClick', () => {
    should('hide the help when clicked', () => {
      const overlay = _.tester.bootstrapElement(HELP_OVERLAY);
      triggerHelp([
        {
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
          componentName: 'Component',
        },
      ]);

      const harness = getHarness(overlay, HelpOverlayHarness);
      harness.simulateClick();

      assert(overlay).to.matchSnapshot('help-overlay__hidden.html');
    });
  });
});

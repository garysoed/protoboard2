import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {$window, _p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';
import {map} from 'rxjs/operators';

import {TriggerType} from '../core/trigger-spec';

import render from './goldens/help-overlay__render.html';
import renderEmpty from './goldens/help-overlay__render_empty.html';
import {HelpOverlay} from './help-overlay';
import {$helpService, HelpContent, ShowHelpEvent} from './help-service';


const testerFactory = new PersonaTesterFactory(_p);
const ACTION_NAME = 'ACTION_NAME';

function triggerHelp(contents: readonly HelpContent[]): void {
  const event = new ShowHelpEvent();
  for (const content of contents) {
    event.add(content);
  }
  window.dispatchEvent(event);
}

test('@protoboard2/action/help-overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({render, renderEmpty}));

    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $window, withValue: window},
      ],
      rootCtrls: [HelpOverlay],
      rootDoc: document,
    });
    const {element, harness} = tester.createHarness(HelpOverlay);

    return {element, harness, tester};
  });

  test('renderIsVisible', () => {
    should('not add the isVisible class if there are no actions in the help service', () => {
      triggerHelp([]);
      assert(_.harness.root._.isVisibleClass).to.emitWith(false);
    });

    should('add the isVisible class if there is an action in the help service', () => {
      triggerHelp([
        {
          tag: 'tag',
          actions: [{trigger: {type: TriggerType.CLICK}, actionName: ACTION_NAME}],
        },
      ]);

      assert(_.harness.root._.isVisibleClass).to.emitWith(true);
    });
  });

  test('tables$', () => {
    should('render tables correctly', () => {
      triggerHelp([
        {
          tag: 'tag-1',
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
        },
        {
          tag: 'tag-2',
          actions: [
            {trigger: {type: TriggerType.D, shift: true, ctrl: true}, actionName: ACTION_NAME},
          ],
        },
      ]);

      assert(_.element).to.matchSnapshot('render');
    });

    should('render deletion correctly', () => {
      triggerHelp([
        {
          tag: 'tag',
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
        },
      ]);
      triggerHelp([]);

      assert(_.element).to.matchSnapshot('renderEmpty');
    });
  });

  test('setupHandleClick', () => {
    should('hide the help when clicked', () => {
      triggerHelp([
        {
          tag: 'tag',
          actions: [
            {trigger: {type: TriggerType.CLICK, meta: true, alt: true}, actionName: ACTION_NAME},
          ],
        },
      ]);

      _.harness.root._.click();

      assert(_.harness.root._.isVisibleClass).to.emitWith(false);

      const actionsLength$ = $helpService.get(_.tester.vine).contents$.pipe(
          map(actions => actions.length),
      );
      assert(actionsLength$).to.emitWith(0);
    });
  });
});

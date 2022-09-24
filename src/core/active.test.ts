import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {$asMap, $map} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {ParseType, renderString, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {of} from 'rxjs';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {componentId} from '../id/component-id';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import {ACTIVE} from './active';
import {$activeState} from './active-spec';
import goldens from './goldens/goldens.json';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));


test('@protoboard2/src/core/active', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/core/goldens', goldens));

    const tester = setupTest({roots: [ACTIVE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  test('itemCount$', () => {
    should('render the 0 item count correctly', () => {
      const element = _.tester.bootstrapElement(ACTIVE);
      document.body.appendChild(element);

      $activeState.get(_.tester.vine).contentIds.next([]);

      assert(element).to.matchSnapshot('active__empty.html');
    });

    should('render the 1 item count correctly', () => {
      registerComponentRenderSpec(_.tester.vine, () => {
        return renderTextNode({
          textContent: of('one'),
        });
      });

      const element = _.tester.bootstrapElement(ACTIVE);
      document.body.appendChild(element);

      $activeState.get(_.tester.vine).contentIds.next([{}].map(componentId));

      assert(element).to.matchSnapshot('active__one.html');
    });

    should('render with overflow count correctly', () => {
      const ids = $pipe(
          ['one', 'two', 'three', 'four', 'five'],
          $map(text => [componentId(), text] as const),
          $asMap(),
      );
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(ids.get(id) ?? ''),
        });
      });

      const element = _.tester.bootstrapElement(ACTIVE);
      document.body.appendChild(element);

      $activeState.get(_.tester.vine).contentIds.next([...ids.keys()]);

      assert(element).to.matchSnapshot('active__overflow.html');
    });
  });

  test('position', () => {
    should('render left correctly', () => {
      const left = 123;
      registerComponentRenderSpec(_.tester.vine, () => {
        return renderString({
          raw: of('<div>content</div>'),
          parseType: ParseType.HTML,
          spec: {},
        });
      });

      const element = _.tester.bootstrapElement(ACTIVE);
      document.body.appendChild(element);

      $activeState.get(_.tester.vine).contentIds.next(['one'].map(componentId));

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));
      _.tester.fakeTime.tickToTrigger();

      assert(element).to.matchSnapshot('active__position.html');
    });
  });
});

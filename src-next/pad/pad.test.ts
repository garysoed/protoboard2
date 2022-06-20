import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ParseType, query, renderString, SVG} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import testSvg from '../asset/icon.svg';
import {componentId} from '../id/component-id';
import {stampId} from '../id/stamp-id';
import {registerStampRenderSpec} from '../renderspec/render-stamp-spec';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import goldens from './goldens/goldens.json';
import {PAD} from './pad';
import {PadContentType, padState} from './pad-state';
import {PadHarness} from './testing/pad-harness';

test('@protoboard2/src-next/pad/pad', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/pad/goldens', goldens));

    const tester = setupTest({
      roots: [PAD],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('stamp action', _, init => {
    const STAMP_A_ID = stampId('a');
    const STAMP_B_ID = stampId('b');

    const _ = init(_ => {
      // TODO: Add shades
      // TODO: Center align
      registerStampRenderSpec(_.tester.vine, state => {
        return renderString({
          raw: of(testSvg),
          parseType: ParseType.SVG,
          spec: {
            root: query(null, SVG, {}),
          },
          runs: $ => [
            of(`${state.x}`).pipe($.root.x()),
            of(`${state.y}`).pipe($.root.y()),
            of('50px').pipe($.root.width()),
            of('50px').pipe($.root.height()),
          ],
        });
      });
      const state = $stateService.get(_.tester.vine).addRoot(padState(componentId('id')))._();
      const element = _.tester.createElement(PAD);
      element.state = state;
      return {..._, element, state};
    });

    should('trigger on click', () => {
      const stampAConfig = {
        stampId: STAMP_A_ID,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
      };
      const stampBConfig = {
        stampId: STAMP_B_ID,
        stampName: 'Stamp B',
        type: TriggerType.B,
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1 = {type: PadContentType.STAMP, stampId: STAMP_A_ID, x: 12, y: 34};
      const oldStamp2 = {type: PadContentType.STAMP, stampId: STAMP_B_ID, x: 56, y: 78};
      run(of([oldStamp1, oldStamp2]).pipe(_.state.$('contents').set()));

      const harness = getHarness(_.element, PadHarness);
      harness.simulateTrigger(TriggerType.CLICK, {clientX: 123, clientY: 456});

      assert(_.element).to.matchSnapshot('pad__stamp_click.html');
    });

    should('trigger on function call', () => {
      const stampAConfig = {
        stampId: STAMP_A_ID,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
      };
      const stampBConfig = {
        stampId: STAMP_B_ID,
        stampName: 'Stamp B',
        type: TriggerType.B,
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1 = {type: PadContentType.STAMP, stampId: STAMP_A_ID, x: 12, y: 34};
      const oldStamp2 = {type: PadContentType.STAMP, stampId: STAMP_B_ID, x: 56, y: 78};
      run(of([oldStamp1, oldStamp2]).pipe(_.state.$('contents').set()));

      _.element.stamp({stampId: STAMP_A_ID, x: 123, y: 456});

      assert(_.element).to.matchSnapshot('pad__stamp_call.html');
    });
  });
});
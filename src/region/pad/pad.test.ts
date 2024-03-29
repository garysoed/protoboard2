import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ostyle, ParseType, query, renderString, SVG} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import testSvg from '../../asset/icon.svg';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';
import {TriggerType} from '../../types/trigger-spec';

import goldens from './goldens/goldens.json';
import {LineRenderSpec, PAD, StampRenderSpec} from './pad';
import {PadContentType, padState, StampState} from './pad-state';
import {PadHarness} from './testing/pad-harness';

test('@protoboard2/src/region/pad/pad', () => {
  function renderLine(): LineRenderSpec {
    return {
      stroke: of('orange'),
      strokeWidth: of(10),
    };
  }

  function renderStamp(shade: string): (state: StampState) => StampRenderSpec {
    return state => renderString({
      raw: of(testSvg),
      parseType: ParseType.SVG,
      spec: {
        root: query(null, SVG, {}),
        colorable: query('#foreground', SVG, {
          style: ostyle('fill'),
        }),
      },
      runs: $ => [
        of(state.x - 25).pipe($.root.x()),
        of(state.y - 25).pipe($.root.y()),
        of('50px' as const).pipe($.root.width()),
        of('50px' as const).pipe($.root.height()),
        of(shade).pipe($.colorable.style()),
      ],
    });
  }

  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/region/pad/goldens', goldens));

    const tester = setupTest({
      roots: [PAD],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('stamp action', () => {
    const STAMP_A_ID = 'a';
    const STAMP_B_ID = 'b';

    setup(_, () => {
      const state = padState({});
      const element = _.tester.bootstrapElement(PAD);
      element.state = state;
      return {..._, element, state};
    });

    should('trigger on click', () => {
      const stampAConfig = {
        stampId: STAMP_A_ID,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
        renderFn: renderStamp('steelblue'),
      };
      const stampBConfig = {
        stampId: STAMP_B_ID,
        stampName: 'Stamp B',
        type: TriggerType.B,
        renderFn: renderStamp('orange'),
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1: StampState = {type: PadContentType.STAMP, stampId: STAMP_A_ID, x: 12, y: 34};
      const oldStamp2: StampState = {type: PadContentType.STAMP, stampId: STAMP_B_ID, x: 56, y: 78};
      _.state.contents.next([oldStamp1, oldStamp2]);

      const harness = getHarness(_.element, PadHarness);
      harness.simulateTrigger(TriggerType.CLICK, {clientX: 123, clientY: 456});

      assert(_.element).to.matchSnapshot('pad__stamp_click.html');
    });

    should('trigger on function call', () => {
      const stampAConfig = {
        stampId: STAMP_A_ID,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
        renderFn: renderStamp('steelblue'),
      };
      const stampBConfig = {
        stampId: STAMP_B_ID,
        stampName: 'Stamp B',
        type: TriggerType.B,
        renderFn: renderStamp('orange'),
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1: StampState = {type: PadContentType.STAMP, stampId: STAMP_A_ID, x: 12, y: 34};
      const oldStamp2: StampState = {type: PadContentType.STAMP, stampId: STAMP_B_ID, x: 56, y: 78};
      _.state.contents.next([oldStamp1, oldStamp2]);

      _.element.stamp({stampId: STAMP_A_ID, x: 123, y: 456});

      assert(_.element).to.matchSnapshot('pad__stamp_call.html');
    });
  });

  test('line action', () => {
    const LINE_ID = 'line';

    setup(_, () => {
      const state = padState({});
      const element = _.tester.bootstrapElement(PAD);
      element.state = state;

      return {..._, element};
    });

    should('trigger on click', () => {
      const config = {
        lineId: LINE_ID,
        lineName: 'Line',
        type: TriggerType.CLICK,
        renderFn: renderLine,
      };
      _.element.lineConfigs = [config];

      const harness = getHarness(_.element, PadHarness);
      harness.simulateTrigger(TriggerType.CLICK, {clientX: 12, clientY: 45});
      harness.simulateMouseMove({clientX: 36, clientY: 135});

      assert(_.element).to.matchSnapshot('pad__line_halfline_click.html');

      harness.simulateTrigger(TriggerType.CLICK, {clientX: 24, clientY: 90});

      assert(_.element).to.matchSnapshot('pad__line_click.html');
    });

    should('trigger on function call', () => {
      const config = {
        lineId: LINE_ID,
        lineName: 'Line',
        type: TriggerType.CLICK,
        renderFn: renderLine,
      };
      _.element.lineConfigs = [config];

      const harness = getHarness(_.element, PadHarness);
      _.element.line({lineId: LINE_ID, x: 12, y: 45});
      harness.simulateMouseMove({clientX: 36, clientY: 135});

      assert(_.element).to.matchSnapshot('pad__line_halfline_call.html');

      _.element.line({lineId: LINE_ID, x: 24, y: 90});

      assert(_.element).to.matchSnapshot('pad__line_call.html');
    });
  });
});
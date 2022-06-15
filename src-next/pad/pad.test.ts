import {$stateService} from 'grapevine';
import {arrayThat, assert, objectThat, run, should, test} from 'gs-testing';
import {getHarness, setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import {componentId} from '../id/component-id';
import {stampId} from '../id/stamp-id';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import {PAD} from './pad';
import {PadContentType, padState, StampState} from './pad-state';
import {PadHarness} from './testing/pad-harness';

test('@protoboard2/src-next/pad/pad', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [PAD],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('stamp action', _, init => {
    const _ = init(_ => {
      const state = $stateService.get(_.tester.vine).addRoot(padState(componentId('id')))._();
      const element = _.tester.createElement(PAD);
      element.state = state;
      return {..._, element, state};
    });

    should('trigger on click', () => {
      const stampAId = stampId('a');
      const stampAConfig = {
        stampId: stampAId,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
      };
      const stampBId = stampId('b');
      const stampBConfig = {
        stampId: stampBId,
        stampName: 'Stamp B',
        type: TriggerType.B,
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1 = {type: PadContentType.STAMP, stampId: stampAId, x: 12, y: 34};
      const oldStamp2 = {type: PadContentType.STAMP, stampId: stampBId, x: 56, y: 78};
      run(of([oldStamp1, oldStamp2]).pipe(_.state.$('contents').set()));

      const harness = getHarness(_.element, PadHarness);
      harness.simulateTrigger(TriggerType.CLICK, {clientX: 123, clientY: 456});

      assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
        oldStamp1,
        oldStamp2,
        objectThat<StampState>().haveProperties({stampId: stampAId, x: 123, y: 456}),
      ]));
    });

    should('trigger on function call', () => {
      const stampAId = stampId('a');
      const stampAConfig = {
        stampId: stampAId,
        stampName: 'Stamp A',
        type: TriggerType.CLICK,
      };
      const stampBId = stampId('b');
      const stampBConfig = {
        stampId: stampBId,
        stampName: 'Stamp B',
        type: TriggerType.B,
      };

      _.element.stampConfigs = [stampAConfig, stampBConfig];

      const oldStamp1 = {type: PadContentType.STAMP, stampId: stampAId, x: 12, y: 34};
      const oldStamp2 = {type: PadContentType.STAMP, stampId: stampBId, x: 56, y: 78};
      run(of([oldStamp1, oldStamp2]).pipe(_.state.$('contents').set()));

      _.element.stamp({stampId: stampAId, x: 123, y: 456});

      assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
        oldStamp1,
        oldStamp2,
        objectThat<StampState>().haveProperties({stampId: stampAId, x: 123, y: 456}),
      ]));
    });
  });
});
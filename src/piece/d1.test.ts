import {arrayThat, assert, createSmartMatcher, createSpySubject, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness, setupTest} from 'persona/export/testing';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {$activeState} from '../core/active-spec';
import {ComponentId} from '../id/component-id';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import {D1, d1State} from './d1';
import goldens from './goldens/goldens.json';
import {D1Harness} from './testing/d1-harness';


test('@protoboard2/src/piece/d1', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/piece/goldens', goldens));
    const tester = setupTest({roots: [D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});
    return {tester};
  });

  should('render the face correctly', () => {
    const state = d1State({face: createRenderSpec('steelblue')});

    const element = _.tester.bootstrapElement(D1);
    element.state = state;

    assert(element).to.matchSnapshot('d1__render.html');
  });

  test('pick action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D1);
      return {..._, element};
    });

    should('trigger on click', () => {
      const state = d1State({face: createRenderSpec('steelblue')});
      _.element.state = state;

      const harness = getHarness(_.element, D1Harness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([state.id])]);
    });

    should('trigger on function call', () => {
      const state = d1State({face: createRenderSpec('steelblue')});
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([state.id])]);
    });
  });

  test('rotate action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D1);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on R', () => {
      const state = d1State({face: createRenderSpec('steelblue')});
      _.element.state = state;

      const harness = getHarness(_.element, D1Harness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d1__rotate-click.html');
    });

    should('trigger on function call', () => {
      const state = d1State({face: createRenderSpec('steelblue')});
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('d1__rotate-call.html');
    });
  });

  test('help action', () => {
    should('display the correct help contents', () => {
      const element = _.tester.bootstrapElement(D1);
      const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));
      const harness = getHarness(element, D1Harness);
      harness.simulateHelp();

      assert(event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {
            actions: [
              {actionName: 'Pick', trigger: {type: TriggerType.CLICK}},
              {actionName: 'Rotate', trigger: {type: TriggerType.R}},
            ],
            componentName: 'D1',
          },
        ]),
      ]);
    });
  });
});
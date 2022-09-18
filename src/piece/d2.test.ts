import {arrayThat, assert, createSmartMatcher, createSpySubject, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {incrementingRandom} from 'gs-tools/export/random2';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {$activeState} from '../core/active-spec';
import {ComponentId, componentId} from '../id/component-id';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';
import {$random, $randomSeed} from '../util/random';

import {D2, d2State} from './d2';
import goldens from './goldens/goldens.json';
import {D2Harness} from './testing/d2-harness';


const FACE_1_SPEC = createRenderSpec('black');
const FACE_2_SPEC = createRenderSpec('steelblue');


test('@protoboard2/src/piece/d2', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/piece/goldens', goldens));
    const seed$ = new BehaviorSubject<number>(0.9);

    const tester = setupTest({
      roots: [D2, TEST_FACE],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: incrementingRandom(10)},
        {override: $randomSeed, withValue: () => seed$.getValue()},
      ],
    });

    return {seed$, tester};
  });

  should('render the face correctly', () => {
    const state = d2State(componentId({}), [FACE_1_SPEC, FACE_2_SPEC]);

    const element = _.tester.bootstrapElement(D2);
    element.state = state;

    assert(element).to.matchSnapshot('d2__render.html');
  });

  test('flip action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D2);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = componentId('');
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.F);

      assert(_.element).to.matchSnapshot('d2__flip-keydown.html');
    });

    should('trigger on function call', () => {
      const id = componentId('');
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateFlip();

      assert(_.element).to.matchSnapshot('d2__flip-call.html');
    });
  });

  test('pick action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D2);
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = componentId({});
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([id])]);
    });

    should('trigger on function call', () => {
      const id = componentId({});
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([id])]);
    });
  });

  test('roll action', () => {
    setup(_, () => {
      _.seed$.next(0.7);
      const element = _.tester.bootstrapElement(D2);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = componentId({});
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.L);

      assert(_.element).to.matchSnapshot('d2__roll-keydown.html');
    });

    should('trigger on function call', () => {
      const id = componentId({});
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;
      _.element.roll(undefined);

      assert(_.element).to.matchSnapshot('d2__roll-call.html');
    });
  });

  test('rotate action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D2);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = componentId('');
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d2__rotate-keydown.html');
    });

    should('trigger on function call', () => {
      const id = componentId({});
      const state = d2State(id, [FACE_1_SPEC, FACE_2_SPEC]);
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('d2__rotate-call.html');
    });
  });

  test('help action', () => {
    should('display the correct help contents', () => {
      const element = _.tester.bootstrapElement(D2);
      const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));
      const harness = getHarness(element, D2Harness);
      harness.simulateHelp();

      assert(event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {
            actions: [
              {actionName: 'Flip', trigger: {type: TriggerType.F}},
              {actionName: 'Pick', trigger: {type: TriggerType.CLICK}},
              {actionName: 'Roll', trigger: {type: TriggerType.L}},
              {actionName: 'Rotate', trigger: {type: TriggerType.R}},
            ],
            componentName: 'D2',
          },
        ]),
      ]);
    });
  });
});
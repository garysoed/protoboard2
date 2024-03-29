import {arrayThat, assert, createSmartMatcher, createSpySubject, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {incrementingRandom} from 'gs-tools/export/random';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {$activeState} from '../core/active-spec';
import {ComponentId} from '../id/component-id';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';
import {$random, $randomSeed} from '../util/random';

import {D6, d6State} from './d6';
import goldens from './goldens/goldens.json';
import {D6Harness} from './testing/d6-harness';


const FACES = [
  createRenderSpec('black'),
  createRenderSpec('steelblue'),
  createRenderSpec('crimson'),
  createRenderSpec('forestgreen'),
  createRenderSpec('orange'),
  createRenderSpec('rebeccapurple'),
] as const;


test('@protoboard2/src/piece/d6', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/piece/goldens', goldens));

    const seed$ = new BehaviorSubject<number>(0.9);
    const tester = setupTest({
      roots: [D6, TEST_FACE],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: incrementingRandom(10)},
        {override: $randomSeed, withValue: () => seed$.getValue()},
      ],
    });

    return {seed$, tester};
  });

  should('render the face correctly', () => {
    const state = d6State({faces: FACES});

    const element = _.tester.bootstrapElement(D6);
    element.state = state;

    assert(element).to.matchSnapshot('d6__render.html');
  });

  test('flip action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D6);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTrigger(TriggerType.F);

      assert(_.element).to.matchSnapshot('d6__flip-keydown.html');
    });

    should('trigger on function call', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateFlip();

      assert(_.element).to.matchSnapshot('d6__flip-call.html');
    });
  });

  test('pick action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D6);
      return {..._, element};
    });

    should('trigger on click', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([state.id])]);
    });

    should('trigger on function call', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([state.id])]);
    });
  });

  test('roll action', () => {
    setup(_, () => {
      _.seed$.next(0.7);
      const element = _.tester.bootstrapElement(D6);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTrigger(TriggerType.L);

      assert(_.element).to.matchSnapshot('d6__roll-keydown.html');
    });

    should('trigger on function call', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;
      _.element.roll(undefined);

      assert(_.element).to.matchSnapshot('d6__roll-call.html');
    });
  });

  test('rotate action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D6);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d6__rotate-keydown.html');
    });

    should('trigger on function call', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('d6__rotate-call.html');
    });
  });

  test('turn action', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(D6);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTrigger(TriggerType.T);

      assert(_.element).to.matchSnapshot('d6__turn-keydown.html');
    });

    should('trigger on function call', () => {
      const state = d6State({faces: FACES});
      _.element.state = state;

      const harness = getHarness(_.element, D6Harness);
      harness.simulateTurn();

      assert(_.element).to.matchSnapshot('d6__turn-call.html');
    });
  });

  test('help action', () => {
    should('display the correct help contents', () => {
      const element = _.tester.bootstrapElement(D6);
      const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));
      const harness = getHarness(element, D6Harness);
      harness.simulateHelp();

      assert(event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {
            actions: [
              {actionName: 'Flip', trigger: {type: TriggerType.F}},
              {actionName: 'Pick', trigger: {type: TriggerType.CLICK}},
              {actionName: 'Roll', trigger: {type: TriggerType.L}},
              {actionName: 'Rotate', trigger: {type: TriggerType.R}},
              {actionName: 'Turn', trigger: {type: TriggerType.T}},
            ],
            componentName: 'D6',
          },
        ]),
      ]);
    });
  });
});
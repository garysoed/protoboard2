import {$stateService} from 'grapevine';
import {arrayThat, assert, createSmartMatcher, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {getHarness, setupTest} from 'persona/export/testing';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {$activeState} from '../core/active-spec';
import {faceId} from '../id/face-id';
import {registerFaceRenderSpec} from '../renderspec/render-face-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';
import {$random} from '../util/random';

import {D2, d2State, D2State} from './d2';
import goldens from './goldens/goldens.json';
import {D2Harness} from './testing/d2-harness';


const FACE_1_ID = faceId('black');
const FACE_2_ID = faceId('steelblue');


test('@protoboard2/src/piece/d2', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/piece/goldens', goldens));

    const seed = new FakeSeed();
    const tester = setupTest({
      roots: [D2, TEST_FACE],
      overrides: [
        {override: $random, withValue: fromSeed(seed)},
        THEME_LOADER_TEST_OVERRIDE,
      ],
    });

    registerFaceRenderSpec(tester.vine, renderTestFace);
    return {seed, tester};
  });

  should('render the face correctly', () => {
    const state = $stateService.get(_.tester.vine).addRoot<D2State>(
        d2State({}, [FACE_1_ID, FACE_2_ID]),
    )._();

    const element = _.tester.createElement(D2);
    element.state = state;

    assert(element).to.matchSnapshot('d2__render.html');
  });

  test('flip action', _, init => {
    const _ = init(_ => {
      const element = _.tester.createElement(D2);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = '';
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.F);

      assert(_.element).to.matchSnapshot('d2__flip-keydown.html');
    });

    should('trigger on function call', () => {
      const id = '';
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateFlip();

      assert(_.element).to.matchSnapshot('d2__flip-call.html');
    });
  });

  test('pick action', _, init => {
    const _ = init(_ => {
      const element = _.tester.createElement(D2);
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).$('contentIds')).to
          .emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).$('contentIds')).to
          .emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });
  });

  test('roll action', _, init => {
    const _ = init(_ => {
      _.seed.values = [0.7];
      const element = _.tester.createElement(D2);
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.L);

      assert(_.element).to.matchSnapshot('d2__roll-keydown.html');
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;
      _.element.roll(undefined);

      assert(_.element).to.matchSnapshot('d2__roll-call.html');
    });
  });

  test('rotate action', _, init => {
    const _ = init(_ => {
      const element = _.tester.createElement(D2);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on keydown', () => {
      const id = '';
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;

      const harness = getHarness(_.element, D2Harness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d2__rotate-keydown.html');
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D2State>(
          d2State(id, [FACE_1_ID, FACE_2_ID]),
      )._();
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('d2__rotate-call.html');
    });
  });

  test('help action', () => {
    should('display the correct help contents', () => {
      const element = _.tester.createElement(D2);
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
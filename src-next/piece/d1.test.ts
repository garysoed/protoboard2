import {$stateService} from 'grapevine';
import {arrayThat, assert, createSmartMatcher, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness, setupTest} from 'persona/export/testing';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {$activeState} from '../core/active-spec';
import {componentId, getPayload} from '../id/component-id';
import {faceId} from '../id/face-id';
import {registerFaceRenderSpec} from '../renderspec/render-face-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import {D1, d1State, D1State} from './d1';
import goldens from './goldens/goldens.json';
import {D1Harness} from './testing/d1-harness';


const FACE_ID = faceId('steelblue');


test('@protoboard2/src/piece/d1', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/piece/goldens', goldens));
    const tester = setupTest({roots: [D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    registerFaceRenderSpec(tester.vine, renderTestFace);
    return {tester};
  });

  should('render the face correctly', () => {
    const state = $stateService.get(_.tester.vine).addRoot<D1State>(d1State(componentId({}), FACE_ID))._();

    const element = _.tester.bootstrapElement(D1);
    element.state = state;

    assert(element).to.matchSnapshot('d1__render.html');
  });

  test('pick action', _, init => {
    const _ = init(_ => {
      const element = _.tester.bootstrapElement(D1);
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot(d1State(componentId(id), FACE_ID))._();
      _.element.state = state;

      const harness = getHarness(_.element, D1Harness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).$('contentIds').pipe(map(ids => ids.map(getPayload)))).to
          .emitSequence([arrayThat().haveExactElements([id])]);
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot(d1State(componentId(id), FACE_ID))._();
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).$('contentIds').pipe(map(ids => ids.map(getPayload)))).to
          .emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });
  });

  test('rotate action', _, init => {
    const _ = init(_ => {
      const element = _.tester.bootstrapElement(D1);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on R', () => {
      const id = '';
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot(d1State(componentId(id), FACE_ID))._();
      _.element.state = state;

      const harness = getHarness(_.element, D1Harness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d1__rotate-click.html');
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot(d1State(componentId(id), FACE_ID))._();
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
import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';

import {$activeState} from '../core/active-spec';
import {TEST_FACE} from '../testing/test-face';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {TriggerType} from '../types/trigger-spec';

import {D1, d1State, D1State} from './d1';
import goldens from './goldens/goldens.json';


test('@protoboard2/src/piece/d1', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/piece/goldens', goldens));
    const tester = setupTest({roots: [D1, TEST_FACE]});
    return {tester};
  });

  should('render the face correctly', () => {
    const face = _.tester.createElement(TEST_FACE);
    face.setAttribute('shade', 'red');
    face.setAttribute('slot', 'face-0');

    const element = _.tester.createElement(D1);
    element.appendChild(face);

    assert(element).to.matchSnapshot('d1__render.html');
  });

  test('pick action', _, init => {
    const _ = init(_ => {
      const face = _.tester.createElement(TEST_FACE);
      face.setAttribute('shade', 'red');
      face.setAttribute('slot', 'face-0');

      const element = _.tester.createElement(D1);
      element.appendChild(face);
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D1State>(d1State(id))._();
      _.element.state = state;

      const div = getHarness(_.element, '#container', ElementHarness);
      div.simulateClick();

      assert($activeState.get(_.tester.vine).$('contentIds')).to
          .emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D1State>(d1State(id))._();
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).$('contentIds')).to
          .emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });
  });

  test('rotate action', _, init => {
    const _ = init(_ => {
      const face = _.tester.createElement(TEST_FACE);
      face.setAttribute('slot', 'face-0');

      const element = _.tester.createElement(D1);
      element.appendChild(face);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D1State>(d1State(id))._();
      _.element.state = state;

      const div = getHarness(_.element, '#container', TriggerElementHarness);
      div.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('d1__rotate-click.html');
    });

    should('trigger on function call', () => {
      const id = {};
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot<D1State>(d1State(id))._();
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('d1__rotate-call.html');
    });
  });
});
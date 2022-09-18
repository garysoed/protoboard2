import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Type} from 'gs-types';
import {Context, DIV, itarget, ocase, ostyle, query, registerCustomElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, OperatorFunction} from 'rxjs';

import {ComponentId, componentId} from '../id/component-id';
import {TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {PieceState, PIECE_STATE_TYPE} from '../types/piece-state';
import {TriggerType} from '../types/trigger-spec';

import {$activeState} from './active-spec';
import {BasePiece, create$basePiece} from './base-piece';
import goldens from './goldens/goldens.json';


interface TestState extends PieceState { }

const TEST_STATE_TYPE: Type<TestState> = PIECE_STATE_TYPE;

const $test = {
  host: {
    ...create$basePiece<TestState>(TEST_STATE_TYPE).host,
  },
  shadow: {
    container: query('#container', DIV, {
      target: itarget(),
      content: ocase<string>('#ref'),
      height: ostyle('height'),
      width: ostyle('width'),
      transform: ostyle('transform'),
    }),
  },
};

class Test extends BasePiece<TestState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test region');
  }

  renderHeight(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.height();
  }

  renderWidth(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.width();
  }

  renderRotationDeg(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.transform();
  }

  get target$(): Observable<HTMLElement> {
    return this.$.shadow.container.target;
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container"><pbt-face></pbt-face></div>',
});

test('@protoboard2/src/core/base-piece', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/core/goldens', goldens));

    const tester = setupTest({
      roots: [TEST],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    return {tester};
  });

  test('pick', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(TEST);
      return {..._, element};
    });

    should('trigger on click', () => {
      const id = componentId({});
      const state = {id, rotationDeg: new BehaviorSubject(0)};
      _.element.state = state;

      const harness = getHarness(_.element, '#container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.CLICK);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([id])]);
    });

    should('trigger on function call', () => {
      const id = componentId({});
      const state = {id, rotationDeg: new BehaviorSubject(0)};
      _.element.state = state;
      _.element.pick(undefined);

      assert($activeState.get(_.tester.vine).contentIds).to
          .emitSequence([arrayThat<ComponentId>().haveExactElements([id])]);
    });
  });

  test('rotate', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(TEST);
      element.setAttribute('height', '48px');
      element.setAttribute('width', '48px');
      return {..._, element};
    });

    should('trigger on R', () => {
      const id = componentId({});
      const state = {id, rotationDeg: new BehaviorSubject(0)};
      _.element.state = state;

      const harness = getHarness(_.element, '#container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.R);

      assert(_.element).to.matchSnapshot('base-piece__rotate-trigger.html');
    });

    should('trigger on function call', () => {
      const id = componentId({});
      const state = {id, rotationDeg: new BehaviorSubject(0)};
      _.element.state = state;
      _.element.rotate(undefined);

      assert(_.element).to.matchSnapshot('base-piece__rotate-call.html');
    });
  });
});

import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, icall, id, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {ComponentState} from '../types/component-state';
import {IsMultifaced} from '../types/is-multifaced';

import goldens from './goldens/goldens.json';
import {turnAction, TurnConfig} from './turn-action';


interface TestState extends ComponentState, IsMultifaced { }

const $config$ = source(() => new BehaviorSubject<TurnConfig>({step: 1}));

const FACES = [
  'orange',
  'steelblue',
  'purple',
];

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
    trigger: icall('trigger', undefinedType),
  },
  shadow: {
    face: id('face', TEST_FACE),
  },
};

class Test extends BaseComponent<TestState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test component');
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$.host.trigger.pipe(turnAction(this.$, $config$.get(this.$.vine))),
      this.state.$('currentFaceIndex').pipe(
          map(index => FACES[index]),
          this.$.shadow.face.shade(),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '<pbt-face id="face"></pbt-face>',
});

test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/action/goldens', goldens));

    const tester = setupTest({roots: [TEST], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  should('increase the face by the given step', () => {
    $config$.get(_.tester.vine).next({step: 2});
    const state = $stateService.get(_.tester.vine).addRoot<TestState>({
      id: {},
      faces: FACES,
      currentFaceIndex: mutableState(0),
    })._();
    const element = _.tester.createElement(TEST);
    element.state = state;
    element.trigger(undefined);

    assert(element).to.matchSnapshot('turn-action__step.html');
  });

  should('wrap the face index by the count', () => {
    $config$.get(_.tester.vine).next({step: 2});
    const state = $stateService.get(_.tester.vine).addRoot<TestState>({
      id: {},
      faces: FACES,
      currentFaceIndex: mutableState(0),
    })._();
    const element = _.tester.createElement(TEST);
    element.state = state;
    element.trigger(undefined);
    element.trigger(undefined);

    assert(element).to.matchSnapshot('turn-action__wrap.html');
  });
});
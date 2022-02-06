import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {mutableState} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, icall, id, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {ComponentState} from '../types/component-state';
import {IsMultifaced} from '../types/is-multifaced';
import {$random} from '../util/random';

import goldens from './goldens/goldens.json';
import {rollAction} from './roll-action';


interface TestState extends ComponentState, IsMultifaced { }

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
      this.$.host.trigger.pipe(rollAction(this.$)),
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


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/action/goldens', goldens));

    const seed = new FakeSeed();
    const tester = setupTest({
      roots: [TEST],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: fromSeed(seed)},
      ],
    });

    return {seed, tester};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      const state = $stateService.get(_.tester.vine).addRoot<TestState>({
        id: {},
        faces: FACES,
        currentFaceIndex: mutableState(0),
      })._();
      _.seed.values = [0.9];

      const element = _.tester.createElement(TEST);
      element.state = state;
      element.trigger(undefined);

      assert(element).to.matchSnapshot('roll-action.html');
    });
  });
});
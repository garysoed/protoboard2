import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {incrementingRandom} from 'gs-tools/export/random';
import {intersectType, Type} from 'gs-types';
import {Context, icall, ocase, registerCustomElement, root} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {componentId} from '../id/component-id';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {ComponentState, COMPONENT_STATE_TYPE} from '../types/component-state';
import {FaceSpec, IsMultifaced, IS_MULTIFACED_TYPE} from '../types/is-multifaced';
import {$random, $randomSeed} from '../util/random';

import goldens from './goldens/goldens.json';
import {rollAction} from './roll-action';


interface TestState extends ComponentState, IsMultifaced { }

const TEST_STATE_TYPE: Type<TestState> = intersectType([
  COMPONENT_STATE_TYPE,
  IS_MULTIFACED_TYPE,
]);

const FACES = [
  createRenderSpec('orange'),
  createRenderSpec('steelblue'),
  createRenderSpec('purple'),
] as const;

const $test = {
  host: {
    ...create$baseComponent<TestState>(TEST_STATE_TYPE).host,
    trigger: icall('trigger', []),
  },
  shadow: {
    root: root({content: ocase<FaceSpec>()}),
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
          this.$.shadow.root.content(switchMap(spec => spec.renderSpec$)),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '',
});


test('@protoboard2/action/roll-action', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));
    const seed$ = new BehaviorSubject<number>(0.9);

    const tester = setupTest({
      roots: [TEST],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: incrementingRandom(10)},
        {override: $randomSeed, withValue: () => seed$.getValue()},
      ],
    });

    return {seed$, tester};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      const state = {
        id: componentId(),
        faces: FACES,
        currentFaceIndex: new BehaviorSubject(0),
      };
      _.seed$.next(0.9);

      const element = _.tester.bootstrapElement(TEST);
      element.state = state;
      element.trigger(undefined);

      assert(element).to.matchSnapshot('roll-action.html');
    });
  });
});

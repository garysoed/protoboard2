import {source} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
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

import goldens from './goldens/goldens.json';
import {turnAction, TurnConfig} from './turn-action';


interface TestState extends ComponentState, IsMultifaced { }

const TEST_STATE_TYPE: Type<TestState> = intersectType([
  COMPONENT_STATE_TYPE,
  IS_MULTIFACED_TYPE,
]);

const $config$ = source(() => new BehaviorSubject<TurnConfig>({step: 1}));

const FACES = [
  createRenderSpec('orange'),
  createRenderSpec('steelblue'),
  createRenderSpec('purple'),
];

const $test = {
  host: {
    ...create$baseComponent<TestState>(TEST_STATE_TYPE).host,
    trigger: icall('trigger', []),
  },
  shadow: {
    root: root({
      content: ocase<FaceSpec>(),
    }),
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

test('@protoboard2/action/turn-action', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));

    const tester = setupTest({roots: [TEST], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  should('increase the face by the given step', () => {
    $config$.get(_.tester.vine).next({step: 2});
    const state = {
      id: componentId(),
      faces: FACES,
      currentFaceIndex: new BehaviorSubject(0),
    };
    const element = _.tester.bootstrapElement(TEST);
    element.state = state;
    element.trigger(undefined);

    assert(element).to.matchSnapshot('turn-action__step.html');
  });

  should('wrap the face index by the count', () => {
    $config$.get(_.tester.vine).next({step: 2});
    const state = {
      id: componentId(),
      faces: FACES,
      currentFaceIndex: new BehaviorSubject(0),
    };
    const element = _.tester.bootstrapElement(TEST);
    element.state = state;
    element.trigger(undefined);
    element.trigger(undefined);

    assert(element).to.matchSnapshot('turn-action__wrap.html');
  });
});

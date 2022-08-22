import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, ostyle, query, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable} from 'rxjs';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {componentId} from '../id/component-id';
import {renderRotatable} from '../render/render-rotatable';
import {TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {ComponentState} from '../types/component-state';
import {IsRotatable} from '../types/is-rotatable';

import goldens from './goldens/goldens.json';
import {rotateAction, RotateConfig} from './rotate-action';


interface TestState extends ComponentState, IsRotatable { }

const $config$ = source(() => new BehaviorSubject<RotateConfig>({stops: []}));

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
    trigger: icall('trigger', []),
  },
  shadow: {
    div: query('#div', DIV, {
      target: itarget(),
      transform: ostyle('transform'),
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
      this.$.host.trigger.pipe(rotateAction(this.$, $config$.get(this.$.vine))),
      this.state.$('rotationDeg').pipe(renderRotatable(), this.$.shadow.div.transform()),
    ];
  }

  @cache()
  protected get target$(): Observable<HTMLElement> {
    return this.$.shadow.div.target;
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div" style="position: absolute"><pbt-face></pbt-face></div>',
});

test('@protoboard2/src/action/rotate-action', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));

    const tester = setupTest({roots: [TEST], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      $config$.get(_.tester.vine).next({stops: [11, 22, 33]});
      const state = $stateService.get(_.tester.vine).addRoot<TestState>({
        id: componentId({}),
        rotationDeg: mutableState(0),
      })._();
      const element = _.tester.bootstrapElement(TEST);
      element.state = state;
      element.trigger(undefined);

      assert(element).to.matchSnapshot('rotate-action__next.html');
    });

    should('handle rotations that are more than 360', () => {
      $config$.get(_.tester.vine).next({stops: [123, 456, 678]});
      const state = $stateService.get(_.tester.vine).addRoot<TestState>({
        id: componentId({}),
        rotationDeg: mutableState(910),
      })._();
      const element = _.tester.bootstrapElement(TEST);
      element.state = state;
      element.trigger(undefined);

      assert(element).to.matchSnapshot('rotate-action__overflow.html');
    });
  });
});

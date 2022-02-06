import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ImmutableResolver, mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {Context, DIV, id, itarget, omulti, registerCustomElement, renderCustomElement, RenderSpec, renderTextNode} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {Observable, of, OperatorFunction} from 'rxjs';

import {D1, d1State, D1State} from '../piece/d1';
import {D1Harness} from '../piece/testing/d1-harness';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {registerFaceRenderSpec} from '../renderspec/render-face-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {RegionState} from '../types/region-state';
import {TriggerType} from '../types/trigger-spec';

import {$activeState} from './active-spec';
import {BaseRegion, create$baseRegion} from './base-region';
import goldens from './goldens/goldens.json';


interface TestState extends RegionState { }

const $test = {
  host: {
    ...create$baseRegion<TestState>().host,
  },
  shadow: {
    container: id('container', DIV, {
      content: omulti('#ref'),
      target: itarget(),
    }),
  },
};

class Test extends BaseRegion<TestState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test region');
  }

  get target$(): Observable<HTMLElement> {
    return this.$.shadow.container.target;
  }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return this.$.shadow.container.content();
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container"><!-- #ref --></div>',
});

test('@protoboard2/src/core/base-region', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/core/goldens', goldens));
    const tester = setupTest({roots: [D1, TEST, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});
    const states = new Map<string, ImmutableResolver<D1State>>();

    registerFaceRenderSpec(tester.vine, renderTestFace);
    registerComponentRenderSpec(tester.vine, id => {
      if (!stringType.check(id)) {
        return null;
      }
      return renderCustomElement({
        registration: D1,
        id,
        inputs: {
          state: of(states.get(id)),
        },
      });
    });
    return {states, tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(id as string),
          id,
        });
      });

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot(mutableState<TestState>({
        id: 'test',
        contentIds: mutableState([]),
      })).$();
      const element = _.tester.createElement(TEST);
      element.state = state$;

      of(['one', 'two', 'three']).pipe(state$.$('contentIds').set()).subscribe();

      assert(element).to.matchSnapshot('base-region.html');
    });
  });

  test('drop', () => {
    should('move the item from active state when triggered', () => {
      const id = 'steelblue';
      const activeIds$ = $activeState.get(_.tester.vine).$('contentIds');
      of([id]).pipe(activeIds$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      _.states.set(id, stateService.addRoot(d1State(id, id))._());
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      const harness = getHarness(element, '#container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(element).to.matchSnapshot('base-region__drop.html');
      assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
    });

    should('move the item from active state on function calls', () => {
      const id = 'steelblue';
      const activeIds$ = $activeState.get(_.tester.vine).$('contentIds');
      of([id]).pipe(activeIds$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      _.states.set(id, stateService.addRoot(d1State(id, id))._());
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      element.drop(undefined);

      assert(element).to.matchSnapshot('base-region__drop-fn.html');
      assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
    });
  });

  test('setupHandlePick', () => {
    should('remove picked elements', () => {
      const id = 'steelblue';
      _.states.set(id, $stateService.get(_.tester.vine).addRoot(d1State(id, id))._());

      const stateService = $stateService.get(_.tester.vine);
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([id]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulatePick();

      assert(element).to.matchSnapshot('base-region__pick.html');
      assert(regionState.$('contentIds')).to.emitSequence([arrayThat<{}>().beEmpty()]);
    });

    should('not removed element if action is not pick', () => {
      const id = 'steelblue';
      _.states.set(id, $stateService.get(_.tester.vine).addRoot(d1State(id, id))._());

      const stateService = $stateService.get(_.tester.vine);
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([id]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulateRotate();

      assert(element).to.matchSnapshot('base-region__pick-noop.html');
      assert(regionState.$('contentIds')).to.emitSequence([arrayThat<{}>().haveExactElements([id])]);
    });
  });
});

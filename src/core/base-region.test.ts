import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Context, DIV, itarget, oforeach, query, registerCustomElement, renderElement, renderTextNode} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {componentId, ComponentId} from '../id/component-id';
import {D1, d1State, D1State} from '../piece/d1';
import {D1Harness} from '../piece/testing/d1-harness';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {RegionState, REGION_STATE_TYPE} from '../types/region-state';
import {TriggerType} from '../types/trigger-spec';

import {$activeState} from './active-spec';
import {BaseRegion, create$baseRegion, RenderContentFn} from './base-region';
import goldens from './goldens/goldens.json';


interface TestState extends RegionState { }

const $test = {
  host: {
    ...create$baseRegion<TestState>(REGION_STATE_TYPE).host,
  },
  shadow: {
    container: query('#container', DIV, {
      content: oforeach<ComponentId>('#ref'),
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

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<readonly ComponentId[], unknown> {
    return this.$.shadow.container.content(map(id => renderContentFn(id)));
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container"><!-- #ref --></div>',
});

test('@protoboard2/src/core/base-region', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/core/goldens', goldens));
    const tester = setupTest({roots: [D1, TEST, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});
    const states = new Map<ComponentId, D1State>();

    registerComponentRenderSpec(tester.vine, id => {
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(states.get(id)!).pipe($.state())],
      });
    });
    return {states, tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const testId = componentId();
      const contentIds = ['test', 'test', 'test'].map(componentId);

      const idsMap = new Map([
        [testId, 'test'],
        [contentIds[0], 'one'],
        [contentIds[1], 'two'],
        [contentIds[2], 'three'],
      ]);
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(idsMap.get(id) ?? ''),
        });
      });

      const state = {
        id: testId,
        contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = state;

      state.contentIds.next(contentIds);

      assert(element).to.matchSnapshot('base-region.html');
    });
  });

  test('drop', () => {
    should('move the item from active state when triggered', () => {
      const id = componentId();
      const activeIds$ = $activeState.get(_.tester.vine).contentIds;
      activeIds$.next([id]);

      _.states.set(id, d1State({face: createRenderSpec('steelblue'), id}));
      const regionState = {
        id: componentId(),
        contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const harness = getHarness(element, '#container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(element).to.matchSnapshot('base-region__drop.html');
      assert(activeIds$).to.emitSequence([arrayThat<ComponentId>().beEmpty()]);
    });

    should('move the item from active state on function calls', () => {
      const id = componentId();
      const activeIds$ = $activeState.get(_.tester.vine).contentIds;
      activeIds$.next([id]);

      _.states.set(id, d1State({face: createRenderSpec('steelblue'), id}));
      const regionState = {
        id: componentId(),
        contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      element.drop(undefined);

      assert(element).to.matchSnapshot('base-region__drop-fn.html');
      assert(activeIds$).to.emitSequence([arrayThat<ComponentId>().beEmpty()]);
    });
  });

  test('setupHandlePick', () => {
    should('remove picked elements', () => {
      const id = componentId();
      _.states.set(id, d1State({face: createRenderSpec('steelblue'), id}));

      const regionState = {
        id: componentId(),
        contentIds: new BehaviorSubject<readonly ComponentId[]>([id]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulatePick();

      assert(element).to.matchSnapshot('base-region__pick.html');
      assert(regionState.contentIds).to.emitSequence([arrayThat<ComponentId>().beEmpty()]);
    });

    should('not removed element if action is not pick', () => {
      const id = componentId();
      _.states.set(id, d1State({face: createRenderSpec('steelblue'), id}));

      const regionState = {
        id: componentId(),
        contentIds: new BehaviorSubject<readonly ComponentId[]>([id]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulateRotate();

      assert(element).to.matchSnapshot('base-region__pick-noop.html');
      assert(regionState.contentIds).to.emitSequence([
        arrayThat<ComponentId>().haveExactElements([id]),
      ]);
    });
  });
});

import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {forwardTo} from 'gs-tools/export/rxjs';
import {stringType} from 'gs-types';
import {Context, DIV, itarget, oforeach, query, registerCustomElement, renderElement, renderTextNode} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {componentId, ComponentId, getPayload} from '../id/component-id';
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
      content: oforeach<ComponentId<unknown>>('#ref'),
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

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<ReadonlyArray<ComponentId<unknown>>, unknown> {
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
    const states = new Map<ComponentId<unknown>, D1State>();

    registerComponentRenderSpec(tester.vine, (id) => {
      const payload = getPayload(id);
      if (!stringType.check(payload)) {
        return null;
      }
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
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(getPayload(id) as string),
        });
      });

      const state = {
        id: componentId('test'),
        contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = state;

      of(['one', 'two', 'three'])
          .pipe(
              map(ids => ids.map(componentId)),
              forwardTo(state.contentIds),
          )
          .subscribe();

      assert(element).to.matchSnapshot('base-region.html');
    });
  });

  test('drop', () => {
    should('move the item from active state when triggered', () => {
      const color = 'steelblue';
      const id = componentId(color);
      const activeIds$ = $activeState.get(_.tester.vine).contentIds;
      activeIds$.next([id]);

      _.states.set(id, d1State(id, createRenderSpec(color)));
      const regionState = {
        id: componentId('region'),
        contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const harness = getHarness(element, '#container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(element).to.matchSnapshot('base-region__drop.html');
      assert(activeIds$).to.emitSequence([arrayThat<ComponentId<unknown>>().beEmpty()]);
    });

    should('move the item from active state on function calls', () => {
      const color = 'steelblue';
      const id = componentId(color);
      const activeIds$ = $activeState.get(_.tester.vine).contentIds;
      activeIds$.next([id]);

      _.states.set(id, d1State(id, createRenderSpec(color)));
      const regionState = {
        id: componentId('region'),
        contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      element.drop(undefined);

      assert(element).to.matchSnapshot('base-region__drop-fn.html');
      assert(activeIds$).to.emitSequence([arrayThat<ComponentId<unknown>>().beEmpty()]);
    });
  });

  test('setupHandlePick', () => {
    should('remove picked elements', () => {
      const color = 'steelblue';
      const id = componentId(color);
      _.states.set(id, d1State(id, createRenderSpec(color)));

      const regionState = {
        id: componentId('region'),
        contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([id]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulatePick();

      assert(element).to.matchSnapshot('base-region__pick.html');
      assert(regionState.contentIds).to.emitSequence([arrayThat<ComponentId<unknown>>().beEmpty()]);
    });

    should('not removed element if action is not pick', () => {
      const color = 'steelblue';
      const id = componentId(color);
      _.states.set(id, d1State(id, createRenderSpec(color)));

      const regionState = {
        id: componentId('region'),
        contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([id]),
      };
      const element = _.tester.bootstrapElement(TEST);
      element.state = regionState;

      const d1 = getHarness(element, 'pb-d1', D1Harness);
      d1.simulateRotate();

      assert(element).to.matchSnapshot('base-region__pick-noop.html');
      assert(regionState.contentIds).to.emitSequence([
        arrayThat<ComponentId<unknown>>().haveExactElements([id]),
      ]);
    });
  });
});

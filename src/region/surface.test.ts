import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {$asMap, $map} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {renderElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, of} from 'rxjs';

import {$activeState} from '../core/active-spec';
import {ComponentId, componentId} from '../id/component-id';
import {D1, d1State} from '../piece/d1';
import {D1Harness} from '../piece/testing/d1-harness';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import goldens from './goldens/goldens.json';
import {SURFACE, surfaceState} from './surface';
import {SlotHarness} from './testing/slot-harness';


test('@protoboard2/src/region/surface', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/region/goldens', goldens));

    const tester = setupTest({roots: [SURFACE, D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    const idsMap: Map<ComponentId, string> = new Map();
    registerComponentRenderSpec(tester.vine, id => {
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [
          of(d1State(createRenderSpec(idsMap.get(id) ?? ''), {id})).pipe($.state()),
        ],
      });
    });

    return {tester, idsMap};
  });

  should('render the contents correctly', () => {
    const surfaceIds = $pipe(
        ['red', 'green', 'blue'],
        $map(color => [componentId(), color] as const),
        $asMap(),
    );
    for (const [id, color] of surfaceIds) {
      _.idsMap.set(id, color);
    }
    const state$ = surfaceState({
      contentIds: new BehaviorSubject<readonly ComponentId[]>([...surfaceIds.keys()]),
    });
    const element = _.tester.bootstrapElement(SURFACE);
    element.state = state$;

    assert(element).to.matchSnapshot('surface__render.html');
  });

  test('drop action', () => {
    setup(_, () => {
      const activeId = componentId();
      _.idsMap.set(activeId, 'steelblue');

      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      activeContents$.next([activeId]);

      const surfaceIds = [{}, {}, {}].map(componentId);
      _.idsMap.set(surfaceIds[0], 'red');
      _.idsMap.set(surfaceIds[1], 'green');
      _.idsMap.set(surfaceIds[2], 'blue');

      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(surfaceIds),
      });
      const element = _.tester.bootstrapElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(_.element).to.matchSnapshot('surface__drop-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateDrop();

      assert(_.element).to.matchSnapshot('surface__drop-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });
  });

  test('pick child action', () => {
    setup(_, () => {
      const activeId = componentId();
      _.idsMap.set(activeId, 'steelblue');

      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      activeContents$.next([activeId]);

      const surfaceIds = [{}, {}, {}].map(componentId);
      _.idsMap.set(surfaceIds[0], 'red');
      _.idsMap.set(surfaceIds[1], 'green');
      _.idsMap.set(surfaceIds[2], 'blue');

      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(surfaceIds),
      });
      const element = _.tester.bootstrapElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, activeId, element, surfaceIds};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulateTrigger(TriggerType.CLICK);

      assert(_.element).to.matchSnapshot('surface__pick-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<ComponentId>().haveExactElements([_.activeId, _.surfaceIds[1]]),
      );
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulatePick();

      assert(_.element).to.matchSnapshot('surface__pick-call.html');
      assert(_.activeContents$).to
          .emitWith(arrayThat<ComponentId>().haveExactElements([_.activeId, _.surfaceIds[1]]));
    });
  });
});
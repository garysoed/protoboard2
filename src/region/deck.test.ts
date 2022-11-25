import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {incrementingRandom} from 'gs-tools/export/random';
import {forwardTo} from 'gs-tools/export/rxjs';
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
import {$random, $randomSeed} from '../util/random';

import {DECK} from './deck';
import goldens from './goldens/goldens.json';
import {surfaceState} from './surface';
import {DeckHarness} from './testing/deck-harness';


test('@protoboard2/src/region/deck', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/region/goldens', goldens));
    const seed$ = new BehaviorSubject<number>(0.9);

    const tester = setupTest({
      roots: [DECK, D1, TEST_FACE],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: incrementingRandom(10)},
        {override: $randomSeed, withValue: () => seed$.getValue()},
      ],
    });

    const idsMap: Map<ComponentId, string> = new Map();
    registerComponentRenderSpec(tester.vine, (id) => {
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [
          of(d1State({id, face: createRenderSpec(idsMap.get(id) ?? '')})).pipe($.state()),
        ],
      });
    });

    return {idsMap, seed$, tester};
  });

  should('render the contents correctly', () => {
    const contentIds = ['test', 'test', 'test'].map(componentId);
    _.idsMap.set(contentIds[0], 'red');
    _.idsMap.set(contentIds[1], 'green');
    _.idsMap.set(contentIds[2], 'blue');

    const state$ = surfaceState({
      contentIds: new BehaviorSubject<readonly ComponentId[]>(contentIds),
    });
    const element = _.tester.bootstrapElement(DECK);
    element.state = state$;

    assert(element).to.matchSnapshot('deck__render.html');
  });

  test('drop action', () => {
    setup(_, () => {
      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      const activeId = componentId();
      _.idsMap.set(activeId, 'steelblue');
      activeContents$.next([activeId]);

      const contentIds = ['test', 'test', 'test'].map(componentId);
      _.idsMap.set(contentIds[0], 'red');
      _.idsMap.set(contentIds[1], 'green');
      _.idsMap.set(contentIds[2], 'blue');
      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(contentIds),
      });
      const element = _.tester.bootstrapElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(_.element).to.matchSnapshot('deck__drop-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });

    should('trigger on function call', () => {
      _.element.drop(undefined);

      assert(_.element).to.matchSnapshot('deck__drop-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });
  });

  test('drop all action', () => {
    setup(_, () => {
      const activeContentIds = ['test', 'test', 'test'].map(componentId);
      _.idsMap.set(activeContentIds[0], 'steelblue');
      _.idsMap.set(activeContentIds[1], 'orange');
      _.idsMap.set(activeContentIds[2], 'chartreuse');

      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      activeContents$.next(activeContentIds);

      const contentIds = ['test', 'test', 'test'].map(componentId);
      _.idsMap.set(contentIds[0], 'red');
      _.idsMap.set(contentIds[1], 'green');
      _.idsMap.set(contentIds[2], 'blue');
      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(contentIds),
      });
      const element = _.tester.bootstrapElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.D, {shiftKey: true});

      assert(_.element).to.matchSnapshot('deck__dropall-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });

    should('trigger on function call', () => {
      _.element.dropAll();

      assert(_.element).to.matchSnapshot('deck__dropall-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId>().beEmpty());
    });
  });

  test('pick child action', () => {
    setup(_, () => {
      const existingId = componentId();

      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      of([existingId]).pipe(forwardTo(activeContents$)).subscribe();

      const contentIds = ['test', 'test', 'test'].map(componentId);
      _.idsMap.set(contentIds[0], 'red');
      _.idsMap.set(contentIds[1], 'green');
      _.idsMap.set(contentIds[2], 'blue');

      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(contentIds),
      });
      const element = _.tester.bootstrapElement(DECK);
      element.state = state$;

      return {..._, activeContents$, contentIds, element, existingId};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      const d1Harness = harness.getContent(D1Harness);
      d1Harness.simulateTrigger(TriggerType.CLICK);

      assert(_.element).to.matchSnapshot('deck__pick-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<ComponentId>().haveExactElements([_.existingId, _.contentIds[2]]),
      );
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, DeckHarness);
      const d1Harness = harness.getContent(D1Harness);
      d1Harness.target.pick();

      assert(_.element).to.matchSnapshot('deck__pick-call.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<ComponentId>().haveExactElements([_.existingId, _.contentIds[2]]),
      );
    });
  });

  test('pick all action', () => {
    setup(_, () => {
      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      const existingId = componentId();
      of([existingId]).pipe(forwardTo(activeContents$)).subscribe();

      const surfaceIds = ['test', 'test', 'test'].map(componentId);
      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(surfaceIds),
      });
      const element = _.tester.bootstrapElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element, existingId, surfaceIds};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.CLICK, {shiftKey: true});

      assert(_.element).to.matchSnapshot('deck__pickall-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<ComponentId>().haveExactElements([
            _.existingId,
            _.surfaceIds[2],
            _.surfaceIds[1],
            _.surfaceIds[0],
          ]),
      );
    });

    should('trigger on function call', () => {
      _.element.pickAll(undefined);

      assert(_.element).to.matchSnapshot('deck__pickall-call.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<ComponentId>().haveExactElements([
            _.existingId,
            _.surfaceIds[2],
            _.surfaceIds[1],
            _.surfaceIds[0],
          ]),
      );
    });
  });

  test('shuffle', () => {
    setup(_, () => {
      const activeContents$ = $activeState.get(_.tester.vine).contentIds;
      of([componentId()]).pipe(forwardTo(activeContents$)).subscribe();

      const contentIds = ['test', 'test', 'test'].map(componentId);
      _.idsMap.set(contentIds[0], 'red');
      _.idsMap.set(contentIds[1], 'green');
      _.idsMap.set(contentIds[2], 'blue');

      const state$ = surfaceState({
        contentIds: new BehaviorSubject<readonly ComponentId[]>(contentIds),
      });
      _.seed$.next(0.8);
      const element = _.tester.bootstrapElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.S);

      assert(_.element).to.matchSnapshot('deck__shuffle-keydown.html');
    });

    should('trigger on function call', () => {
      _.element.shuffle(undefined);

      assert(_.element).to.matchSnapshot('deck__shuffle-call.html');
    });
  });
});
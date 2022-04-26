import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {renderCustomElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import {$activeState} from '../core/active-spec';
import {D1, d1State} from '../piece/d1';
import {D1Harness} from '../piece/testing/d1-harness';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {registerFaceRenderSpec} from '../renderspec/render-face-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';
import {$random} from '../util/random';

import {DECK} from './deck';
import goldens from './goldens/goldens.json';
import {SlotState} from './slot';
import {DeckHarness} from './testing/deck-harness';


test('@protoboard2/src/region/deck', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/region/goldens', goldens));

    const seed = new FakeSeed();
    const tester = setupTest({
      roots: [DECK, D1, TEST_FACE],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: fromSeed(seed)},
      ],
    });

    registerFaceRenderSpec(tester.vine, renderTestFace);
    registerComponentRenderSpec(tester.vine, id => {
      if (!stringType.check(id)) {
        return null;
      }
      return renderCustomElement({
        registration: D1,
        runs: $ => [
          of($stateService.get(tester.vine).addRoot(d1State(id, id))._()).pipe($.state()),
        ],
      });
    });

    return {seed, tester};
  });

  should('render the contents correctly', () => {
    const stateService = $stateService.get(_.tester.vine);
    const state$ = stateService.addRoot<SlotState>({
      id: {},
      contentIds: mutableState(['red', 'green', 'blue']),
    })._();
    const element = _.tester.createElement(DECK);
    element.state = state$;

    assert(element).to.matchSnapshot('deck__render.html');
  });

  test('drop action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SlotState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(_.element).to.matchSnapshot('deck__drop-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });

    should('trigger on function call', () => {
      _.element.drop(undefined);

      assert(_.element).to.matchSnapshot('deck__drop-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });
  });

  test('drop all action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue', 'orange', 'chartreuse']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SlotState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.D, {shiftKey: true});

      assert(_.element).to.matchSnapshot('deck__dropall-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });

    should('trigger on function call', () => {
      _.element.dropAll();

      assert(_.element).to.matchSnapshot('deck__dropall-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });
  });

  test('pick child action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SlotState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      const d1Harness = harness.getContent(D1Harness);
      d1Harness.simulateTrigger(TriggerType.CLICK);

      assert(_.element).to.matchSnapshot('deck__pick-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'blue']),
      );
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, DeckHarness);
      const d1Harness = harness.getContent(D1Harness);
      d1Harness.target.pick();

      assert(_.element).to.matchSnapshot('deck__pick-call.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'blue']),
      );
    });
  });

  test('pick all action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SlotState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(DECK);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, DeckHarness);
      harness.simulateTrigger(TriggerType.CLICK, {shiftKey: true});

      assert(_.element).to.matchSnapshot('deck__pickall-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'blue', 'green', 'red']),
      );
    });

    should('trigger on function call', () => {
      _.element.pickAll(undefined);

      assert(_.element).to.matchSnapshot('deck__pickall-call.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'blue', 'green', 'red']),
      );
    });
  });

  test('shuffle', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SlotState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      _.seed.values = [0.5, 1, 0];
      const element = _.tester.createElement(DECK);
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
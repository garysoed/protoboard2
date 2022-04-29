import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
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

import goldens from './goldens/goldens.json';
import {SURFACE, SurfaceState} from './surface';
import {SlotHarness} from './testing/slot-harness';


test('@protoboard2/src/region/surface', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/region/goldens', goldens));

    const tester = setupTest({roots: [SURFACE, D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

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

    return {tester};
  });

  should('render the contents correctly', () => {
    const stateService = $stateService.get(_.tester.vine);
    const state$ = stateService.addRoot<SurfaceState>({
      id: {},
      contentIds: mutableState(['red', 'green', 'blue']),
    })._();
    const element = _.tester.createElement(SURFACE);
    element.state = state$;

    assert(element).to.matchSnapshot('slot__render.html');
  });

  test('drop action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SurfaceState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(_.element).to.matchSnapshot('slot__drop-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateDrop();

      assert(_.element).to.matchSnapshot('slot__drop-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().beEmpty());
    });
  });

  test('pick child action', _, init => {
    const _ = init(_ => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of(['steelblue']).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SurfaceState>({
        id: {},
        contentIds: mutableState(['red', 'green', 'blue']),
      })._();
      const element = _.tester.createElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulateTrigger(TriggerType.CLICK);

      assert(_.element).to.matchSnapshot('slot__pick-keydown.html');
      assert(_.activeContents$).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'green']),
      );
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulatePick();

      assert(_.element).to.matchSnapshot('slot__pick-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<{}>().haveExactElements(['steelblue', 'green']));
    });
  });
});
import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {renderElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {ComponentId, componentId, getPayload} from '../id/component-id';
import {D1, d1State} from '../piece/d1';
import {D1Harness} from '../piece/testing/d1-harness';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {TriggerType} from '../types/trigger-spec';

import goldens from './goldens/goldens.json';
import {SURFACE, surfaceState, SurfaceState} from './surface';
import {SlotHarness} from './testing/slot-harness';


test('@protoboard2/src/region/surface', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/region/goldens', goldens));

    const tester = setupTest({roots: [SURFACE, D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    registerComponentRenderSpec(tester.vine, (id) => {
      const payload = getPayload(id);
      if (!stringType.check(payload)) {
        return null;
      }
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [
          of(
              $stateService.get(tester.vine).addRoot(d1State(id, createRenderSpec(payload)))._(),
          ).pipe($.state()),
        ],
      });
    });

    return {tester};
  });

  should('render the contents correctly', () => {
    const stateService = $stateService.get(_.tester.vine);
    const state$ = stateService.addRoot<SurfaceState>(surfaceState(componentId({}), {
      contentIds: mutableState(['red', 'green', 'blue'].map(componentId)),
    }))._();
    const element = _.tester.bootstrapElement(SURFACE);
    element.state = state$;

    assert(element).to.matchSnapshot('surface__render.html');
  });

  test('drop action', () => {
    setup(_, () => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of([componentId('steelblue')]).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SurfaceState>(surfaceState(componentId({}), {
        contentIds: mutableState(['red', 'green', 'blue'].map(componentId)),
      }))._();
      const element = _.tester.bootstrapElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(_.element).to.matchSnapshot('surface__drop-keydown.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId<unknown>>().beEmpty());
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      harness.simulateDrop();

      assert(_.element).to.matchSnapshot('surface__drop-call.html');
      assert(_.activeContents$).to.emitWith(arrayThat<ComponentId<unknown>>().beEmpty());
    });
  });

  test('pick child action', () => {
    setup(_, () => {
      const activeContents$ = $activeState.get(_.tester.vine).$('contentIds');
      of([componentId('steelblue')]).pipe(activeContents$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const state$ = stateService.addRoot<SurfaceState>(surfaceState(componentId({}), {
        contentIds: mutableState(['red', 'green', 'blue'].map(componentId)),
      }))._();
      const element = _.tester.bootstrapElement(SURFACE);
      element.state = state$;

      return {..._, activeContents$, element};
    });

    should('trigger on keydown', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulateTrigger(TriggerType.CLICK);

      assert(_.element).to.matchSnapshot('surface__pick-keydown.html');
      assert(_.activeContents$.pipe(map(ids => ids.map(getPayload)))).to.emitWith(
          arrayThat<{}>().haveExactElements(['steelblue', 'green']),
      );
    });

    should('trigger on function call', () => {
      const harness = getHarness(_.element, SlotHarness);
      const d1Harness = harness.getContent(':nth-child(2)', D1Harness);
      d1Harness.simulatePick();

      assert(_.element).to.matchSnapshot('surface__pick-call.html');
      assert(_.activeContents$.pipe(map(ids => ids.map(getPayload)))).to
          .emitWith(arrayThat<{}>().haveExactElements(['steelblue', 'green']));
    });
  });
});
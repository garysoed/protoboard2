import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {Context, DIV, id, itarget, omulti, registerCustomElement, renderCustomElement, RenderSpec, renderTextNode} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {Observable, of, OperatorFunction} from 'rxjs';

import {D1} from '../piece/d1';
import {$getRenderSpec$} from '../render/render-component-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
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
    super($);
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
    const tester = setupTest({roots: [D1, TEST, TEST_FACE]});

    $getRenderSpec$.get(tester.vine).next(id => {
      if (!stringType.check(id)) {
        throw new Error(`Invalid ID ${id}`);
      }
      return renderCustomElement({
        registration: D1,
        id,
        children: [renderTestFace(id, id)],
      });
    });
    return {tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      $getRenderSpec$.get(_.tester.vine).next(id => {
        return renderTextNode({
          textContent: id as string,
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
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      const harness = getHarness(element, 'container', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.D);

      assert(element).to.matchSnapshot('base-region__drop.html');
      assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
    });

    should('move the item from active state on function calls', () => {
      const id = 'steelblue';
      const activeIds$ = $activeState.get(_.tester.vine).$('contentIds');
      of([id]).pipe(activeIds$.set()).subscribe();

      const stateService = $stateService.get(_.tester.vine);
      const regionState = stateService.addRoot<RegionState>({
        id: 'region',
        contentIds: mutableState([]),
      })._();
      const element = _.tester.createElement(TEST);
      element.state = regionState;

      element.drop(undefined);

      assert(element).to.matchSnapshot('base-region__drop.html');
      assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
    });
  });
});

import {$stateService} from 'grapevine';
import {arrayThat, assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {Context, DIV, id, itarget, omulti, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {Observable, of, OperatorFunction} from 'rxjs';

import {$activeState} from '../core/active-spec';
import {create$baseComponent} from '../core/base-component';
import {BaseRegion} from '../core/base-region';
import {D1} from '../piece/d1';
import {$getRenderSpec$} from '../render/render-component-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {onTrigger} from '../trigger/trigger';
import {RegionState} from '../types/region-state';
import {TriggerType} from '../types/trigger-spec';

import {dropAction} from './drop-action';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    ...create$baseComponent<RegionState>().host,
  },
  shadow: {
    div: id('div', DIV, {
      contents: omulti('#ref'),
      target: itarget(),
    }),
  },
};

class Test extends BaseRegion<RegionState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($);
  }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return this.$.shadow.div.contents();
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$.shadow.div.target.pipe(
          onTrigger(of({type: TriggerType.CLICK})),
          dropAction(this.$),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div"><!-- #ref --></div>',
});

test('@protoboard2/src/action/drop-action', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/action/goldens', goldens));

    const tester = setupTest({
      roots: [D1, TEST, TEST_FACE],
    });

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

  should('move the component from active state correctly', () => {
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

    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick();

    assert(element).to.matchSnapshot('drop-action__trigger.html');
    assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
  });

  should('do nothing if there are no components in active state', () => {
    const activeIds$ = $activeState.get(_.tester.vine).$('contentIds');

    const stateService = $stateService.get(_.tester.vine);
    const regionState = stateService.addRoot<RegionState>({
      id: 'region',
      contentIds: mutableState([]),
    })._();
    const element = _.tester.createElement(TEST);
    element.state = regionState;

    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick();

    assert(element).to.matchSnapshot('drop-action__empty.html');
    assert(activeIds$).to.emitSequence([arrayThat<{}>().beEmpty()]);
  });
});

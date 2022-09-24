import {arrayThat, assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {stringType} from 'gs-types';
import {Context, DIV, itarget, oforeach, query, registerCustomElement, renderElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {componentId, ComponentId, getPayload} from '../id/component-id';
import {D1, d1State} from '../piece/d1';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {createRenderSpec, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {onTrigger} from '../trigger/trigger';
import {RegionState, REGION_STATE_TYPE} from '../types/region-state';
import {TriggerType} from '../types/trigger-spec';

import {dropAction} from './drop-action';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    ...create$baseRegion<RegionState>(REGION_STATE_TYPE).host,
  },
  shadow: {
    div: query('#div', DIV, {
      contents: oforeach<ComponentId>('#ref'),
      target: itarget(),
    }),
  },
};

class Test extends BaseRegion<RegionState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test region');
  }

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<readonly ComponentId[], unknown> {
    return this.$.shadow.div.contents(map(id => renderContentFn(id)));
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

  @cache()
  protected get target$(): Observable<HTMLElement> {
    return this.$.shadow.div.target;
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div"><!-- #ref --></div>',
});

test('@protoboard2/src/action/drop-action', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));

    const tester = setupTest({
      roots: [D1, TEST, TEST_FACE],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    registerComponentRenderSpec(tester.vine, id => {
      const payload = getPayload(id);
      if (!stringType.check(payload)) {
        throw new Error(`Invalid ID ${payload}`);
      }
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [
          of(d1State(createRenderSpec(payload), {id})).pipe($.state()),
        ],
      });
    });
    return {tester};
  });

  should('move the component from active state correctly', () => {
    const id = componentId('steelblue');
    const activeIds$ = $activeState.get(_.tester.vine).contentIds;
    activeIds$.next([id]);

    const regionState = {
      id: componentId('region'),
      contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
    };
    const element = _.tester.bootstrapElement(TEST);
    element.state = regionState;

    const harness = getHarness(element, '#div', ElementHarness);
    harness.simulateClick();

    assert(element).to.matchSnapshot('drop-action__trigger.html');
    assert(activeIds$).to.emitSequence([arrayThat<ComponentId>().beEmpty()]);
  });

  should('do nothing if there are no components in active state', () => {
    const activeIds$ = $activeState.get(_.tester.vine).contentIds;

    const regionState = {
      id: componentId('region'),
      contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
    };
    const element = _.tester.bootstrapElement(TEST);
    element.state = regionState;

    const harness = getHarness(element, '#div', ElementHarness);
    harness.simulateClick();

    assert(element).to.matchSnapshot('drop-action__empty.html');
    assert(activeIds$).to.emitSequence([arrayThat<ComponentId>().beEmpty()]);
  });
});

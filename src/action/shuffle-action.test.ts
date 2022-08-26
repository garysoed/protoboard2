import {$stateService} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {incrementingRandom} from 'gs-tools/export/random2';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, oforeach, query, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, OperatorFunction, BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {componentId, ComponentId} from '../id/component-id';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {RegionState} from '../types/region-state';
import {$random, $randomSeed} from '../util/random';

import goldens from './goldens/goldens.json';
import {shuffleAction} from './shuffle-action';


interface TestState extends RegionState { }

const $test = {
  host: {
    ...create$baseRegion<TestState>().host,
    trigger: icall('trigger', []),
  },
  shadow: {
    root: query('#root', DIV, {
      content: oforeach<ComponentId<unknown>>('#content'),
      target: itarget(),
    }),
  },
};

class Test extends BaseRegion<TestState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test component');
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$.host.trigger.pipe(shuffleAction(this.$)),
    ];
  }

  renderContents(renderValuesFn: RenderContentFn): OperatorFunction<ReadonlyArray<ComponentId<unknown>>, unknown> {
    return this.$.shadow.root.content(map(id => renderValuesFn(id)));
  }

  protected get target$(): Observable<HTMLElement> {
    return this.$.shadow.root.target;
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="root"><!-- #content --></div>',
});

test('@protoboard2/action/shuffle-action', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));

    const seed$ = new BehaviorSubject<number>(0.9);

    const tester = setupTest({
      roots: [TEST, TEST_FACE],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $random, withValue: incrementingRandom(10)},
        {override: $randomSeed, withValue: () => seed$.getValue()},
      ],
    });
    registerComponentRenderSpec(tester.vine, renderTestFace);

    return {seed$, tester};
  });

  should('shuffle the child elements correctly', () => {
    _.seed$.next(0.9);

    const state = $stateService.get(_.tester.vine).addRoot<TestState>({
      id: componentId({}),
      contentIds: mutableState(['orange', 'steelblue', 'purple', 'red'].map(componentId)),
    })._();

    const element = _.tester.bootstrapElement(TEST);
    element.state = state;
    element.trigger(undefined);

    assert(element).to.matchSnapshot('shuffle-action.html');
  });
});

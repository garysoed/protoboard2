import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {$asMap, $map} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {incrementingRandom} from 'gs-tools/export/random';
import {$pipe} from 'gs-tools/export/typescript';
import {Context, DIV, icall, itarget, oforeach, query, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {componentId, ComponentId} from '../id/component-id';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {RegionState, REGION_STATE_TYPE} from '../types/region-state';
import {$random, $randomSeed} from '../util/random';

import goldens from './goldens/goldens.json';
import {shuffleAction} from './shuffle-action';


interface TestState extends RegionState { }

const $test = {
  host: {
    ...create$baseRegion<TestState>(REGION_STATE_TYPE).host,
    trigger: icall('trigger', []),
  },
  shadow: {
    root: query('#root', DIV, {
      content: oforeach<ComponentId>('#content'),
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

  renderContents(renderValuesFn: RenderContentFn): OperatorFunction<readonly ComponentId[], unknown> {
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
  const IDS_MAP = $pipe(
      ['orange', 'steelblue', 'purple', 'red'],
      $map(color => [componentId(), color] as const),
      $asMap(),
  );

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
    registerComponentRenderSpec(tester.vine, id => renderTestFace(IDS_MAP.get(id) ?? ''));

    return {seed$, tester};
  });

  should('shuffle the child elements correctly', () => {
    _.seed$.next(0.9);

    const state: TestState = {
      id: componentId(),
      contentIds: new BehaviorSubject<readonly ComponentId[]>([...IDS_MAP.keys()]),
    };

    const element = _.tester.bootstrapElement(TEST);
    element.state = state;
    element.trigger(undefined);

    assert(element).to.matchSnapshot('shuffle-action.html');
  });
});

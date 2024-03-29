import {source} from 'grapevine';
import {assert, createSmartMatcher, createSpySubject, setup, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, query, itarget, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, fromEvent, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {create$baseComponent} from '../core/base-component';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {onTrigger} from '../trigger/trigger';
import {COMPONENT_STATE_TYPE} from '../types/component-state';
import {TriggerType} from '../types/trigger-spec';

import {forwardHelpEvent, helpAction, HelpActionConfig} from './help-action';
import {HelpContent, ShowHelpEvent, SHOW_HELP_EVENT} from './show-help-event';


const $helpConfig$ = source(() => new BehaviorSubject<HelpActionConfig>({helpContent: {actions: [], componentName: ''}}));
const $parentConfig$ = source(() => new BehaviorSubject<HelpActionConfig>({helpContent: {actions: [], componentName: ''}}));

const $test = {
  host: {
    ...create$baseComponent(COMPONENT_STATE_TYPE).host,
  },
  shadow: {
    div: query('#div', DIV, {
      target: itarget(),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.div.target.pipe(
          onTrigger(of({type: TriggerType.CLICK})),
          helpAction(this.$, $helpConfig$.get(this.$.vine)),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div"></div>',
});

const $parent = {
  host: {
    ...create$baseComponent(COMPONENT_STATE_TYPE).host,
  },
  shadow: {
    container: query('#container', DIV, {
      target: itarget(),
    }),
  },
};

class Parent implements Ctrl {
  constructor(private readonly $: Context<typeof $parent>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.container.target.pipe(
          forwardHelpEvent($parentConfig$.get(this.$.vine)),
      ),
    ];
  }
}

const PARENT = registerCustomElement({
  ctrl: Parent,
  deps: [TEST],
  spec: $parent,
  tag: 'pbt-parent',
  template: '<div id="container"><pbt-test></pbt-test></div>',
});

test('@protoboard2/src/action/help-action', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [PARENT]});
    return {tester};
  });

  should('dispatch ShowHelpEvent with the correct content', () => {
    const helpContent = {
      actions: [
        {actionName: 'action1', trigger: {type: TriggerType.A}},
        {actionName: 'action2', trigger: {type: TriggerType.B}},
      ],
      componentName: 'Component',
    };
    $helpConfig$.get(_.tester.vine).next({
      helpContent,
    });
    const element = _.tester.bootstrapElement(TEST);

    const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));
    const harness = getHarness(element, '#div', TriggerElementHarness);
    harness.simulateClick();

    assert(event$.pipe(map(event => event.contents))).to.emitSequence([
      createSmartMatcher<HelpContent[]>([helpContent]),
    ]);
  });

  should('dispatch ShowHelpEvent with appended contents', () => {
    const childHelpContent = {
      actions: [
        {actionName: 'action1', trigger: {type: TriggerType.A}},
        {actionName: 'action2', trigger: {type: TriggerType.B}},
      ],
      componentName: 'Component',
    };
    $helpConfig$.get(_.tester.vine).next({helpContent: childHelpContent});
    const parentHelpContent = {
      actions: [
        {actionName: 'action1', trigger: {type: TriggerType.A}},
        {actionName: 'action3', trigger: {type: TriggerType.C}},
      ],
      componentName: 'Component',
    };
    $parentConfig$.get(_.tester.vine).next({helpContent: parentHelpContent});
    const element = _.tester.bootstrapElement(PARENT);

    const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));
    const child = getHarness(element, 'pbt-test', ElementHarness);
    const harness = getHarness(child.target, '#div', TriggerElementHarness);
    harness.simulateClick();

    assert(event$.pipe(map(event => event.contents))).to.emitSequence([
      createSmartMatcher<HelpContent[]>([childHelpContent, parentHelpContent]),
    ]);
  });
});

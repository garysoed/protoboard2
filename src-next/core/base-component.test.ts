import {$stateService, source} from 'grapevine';
import {assert, createSmartMatcher, createSpySubject, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {mutableState, MutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {EMPTY, fromEvent, Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../action/action-event';
import {pickAction} from '../action/pick-action';
import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {ComponentState} from '../types/component-state';
import {TriggerType} from '../types/trigger-spec';

import {BaseComponent, create$baseComponent} from './base-component';


const CHILD_ACTION = 'Child action';
const ACTION_1 = 'Action 1';
const ACTION_2 = 'Action 2';
const COMPONENT_NAME = 'Component Name';

interface TestState extends ComponentState {
  readonly value: MutableState<number>;
}

const $onUpdate$ = source(() => new Subject<number>());

const $child = {
  host: {
    ...create$baseComponent().host,
    trigger: icall('trigger', []),
  },
  shadow: {
    div: query('#div', DIV, {
      target: itarget(),
    }),
  },
};

class ChildComponent extends BaseComponent<ComponentState> {
  constructor(private readonly $: Context<typeof $child>) {
    super($, COMPONENT_NAME);
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.installAction(
          pickAction,
          CHILD_ACTION,
          this.$.shadow.div.target,
          of({type: TriggerType.L}),
          EMPTY,
      ),
    ];
  }
}

const CHILD = registerCustomElement({
  ctrl: ChildComponent,
  spec: $child,
  tag: 'pbt-child',
  template: '<div id="div"></div>',
});

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
    trigger: icall('trigger', []),
  },
  shadow: {
    container: query('#container', DIV, {
      target: itarget(),
    }),
    div: query('#div', DIV, {
      target: itarget(),
    }),
  },
};

class TestComponent extends BaseComponent<TestState> {
  constructor(
      private readonly $: Context<typeof $test>,
  ) {
    super($, COMPONENT_NAME);
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      $onUpdate$.get(this.$.vine).pipe(this.updateState(resolver => resolver.$('value'))),
      this.installAction(
          pickAction,
          ACTION_1,
          this.$.shadow.div.target,
          of({type: TriggerType.CLICK}),
          this.$.host.trigger,
      ),
      this.installAction(
          pickAction,
          ACTION_2,
          this.$.shadow.container.target,
          of({type: TriggerType.C}),
          EMPTY,
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: TestComponent,
  deps: [CHILD],
  spec: $test,
  tag: 'pbt-test',
  template: `
      <div id="div"></div>
      <div id="container">
        <pbt-child id="child"></pbt-child>
      </div>`,
});

test('@protoboard2/src/core/base-component', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});

    return {tester};
  });

  test('installAction', () => {
    should('trigger the action and dispatch the event', () => {
      const stateService = $stateService.get(_.tester.vine);
      const id = {};
      const state = stateService.addRoot(mutableState<TestState>({
        id,
        value: mutableState(123),
      })).$();

      const element = _.tester.createElement(TEST);
      element.state = state;

      const event$ = createSpySubject(fromEvent<ActionEvent>(element, ACTION_EVENT));
      element.trigger(undefined);

      assert(event$.pipe(map(event => event.action))).to.emitSequence([pickAction]);
      assert(event$.pipe(map(event => event.id))).to.emitSequence([id]);
    });
  });

  test('setupHelpAction', _, init => {
    const _ = init(_ => {
      const stateService = $stateService.get(_.tester.vine);
      const id = {};
      const state = stateService.addRoot(mutableState<TestState>({
        id,
        value: mutableState(123),
      })).$();

      const element = _.tester.createElement(TEST);
      element.state = state;

      const event$ = createSpySubject(fromEvent<ShowHelpEvent>(element, SHOW_HELP_EVENT));

      return {..._, element, event$};
    });

    should('show all the installed actions for separate DOMs', () => {
      const label = 'label';
      _.element.setAttribute('label', label);

      const target = getHarness(_.element, '#div', TriggerElementHarness);
      target.simulateTrigger(TriggerType.QUESTION);

      assert(_.event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {actions: [{actionName: ACTION_1, trigger: {type: TriggerType.CLICK}}], componentName: label},
        ]),
      ]);
      target.simulateMouseOut();

      const container = getHarness(_.element, '#container', TriggerElementHarness);
      container.simulateTrigger(TriggerType.QUESTION);

      assert(_.event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {actions: [{actionName: ACTION_1, trigger: {type: TriggerType.CLICK}}], componentName: label},
        ]),
        createSmartMatcher([
          {actions: [{actionName: ACTION_2, trigger: {type: TriggerType.C}}], componentName: label},
        ]),
      ]);
    });

    should('show installed actions for sub component and the parent target', () => {
      const child = getHarness(_.element, '#child', ElementHarness);
      const harness = getHarness(child.target, '#div', TriggerElementHarness);
      harness.simulateTrigger(TriggerType.QUESTION);

      assert(_.event$.pipe(map(event => event.contents))).to.emitSequence([
        createSmartMatcher([
          {actions: [{actionName: CHILD_ACTION, trigger: {type: TriggerType.L}}], componentName: COMPONENT_NAME},
          {actions: [{actionName: ACTION_2, trigger: {type: TriggerType.C}}], componentName: COMPONENT_NAME},
        ]),
      ]);
    });
  });

  test('updateState', () => {
    should('update the given mutable state, if there is one', () => {
      const stateService = $stateService.get(_.tester.vine);
      const state = stateService.addRoot(mutableState<TestState>({
        id: 'test',
        value: mutableState(123),
      })).$();

      const element = _.tester.createElement(TEST);
      element.state = state;

      const newValue = 345;
      $onUpdate$.get(_.tester.vine).next(newValue);

      assert(state.$('value')).to.emitSequence([newValue]);
    });

    should('do nothing if there are no given mutable states', () => {
      const stateService = $stateService.get(_.tester.vine);
      const value = 123;
      const state = stateService.addRoot(mutableState({
        id: 'id',
        value: mutableState(value),
      })).$();

      _.tester.createElement(TEST);

      $onUpdate$.get(_.tester.vine).next(345);

      assert(state.$('value')).to.emitSequence([value]);
    });
  });
});

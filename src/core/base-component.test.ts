import {source} from 'grapevine';
import {assert, createSmartMatcher, createSpySubject, setup, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {hasPropertiesType, instanceofType, intersectType, Type} from 'gs-types';
import {Context, DIV, icall, itarget, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, EMPTY, fromEvent, Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../action/action-event';
import {pickAction} from '../action/pick-action';
import {ShowHelpEvent, SHOW_HELP_EVENT} from '../action/show-help-event';
import {componentId} from '../id/component-id';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {ComponentState, COMPONENT_STATE_TYPE} from '../types/component-state';
import {TriggerType} from '../types/trigger-spec';

import {BaseComponent, create$baseComponent} from './base-component';


const CHILD_ACTION = 'Child action';
const ACTION_1 = 'Action 1';
const ACTION_2 = 'Action 2';
const COMPONENT_NAME = 'Component Name';

interface TestState extends ComponentState {
  readonly value: Subject<number>;
}

const TEST_STATE_TYPE: Type<TestState> = intersectType([
  COMPONENT_STATE_TYPE,
  hasPropertiesType({
    value: instanceofType<Subject<number>>(Subject),
  }),
]);

const $onUpdate$ = source(() => new Subject<number>());

const $child = {
  host: {
    ...create$baseComponent(COMPONENT_STATE_TYPE).host,
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
    ...create$baseComponent<TestState>(TEST_STATE_TYPE).host,
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

test('@protoboard2/src/core/base-component', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [TEST]});

    return {tester};
  });

  test('installAction', () => {
    should('trigger the action and dispatch the event', () => {
      const id = componentId();
      const state = {
        id,
        value: new BehaviorSubject(123),
      };

      const element = _.tester.bootstrapElement(TEST);
      element.state = state;

      const event$ = createSpySubject(fromEvent<ActionEvent>(element, ACTION_EVENT));
      element.trigger(undefined);

      assert(event$.pipe(map(event => event.action))).to.emitSequence([pickAction]);
      assert(event$.pipe(map(event => event.id))).to.emitSequence([id]);
    });
  });

  test('setupHelpAction', () => {
    setup(_, () => {
      const id = componentId();
      const state = {
        id,
        value: new BehaviorSubject(123),
      };

      const element = _.tester.bootstrapElement(TEST);
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
      const state = {
        id: componentId(),
        value: new BehaviorSubject(123),
      };

      const element = _.tester.bootstrapElement(TEST);
      element.state = state;

      const newValue = 345;
      $onUpdate$.get(_.tester.vine).next(newValue);

      assert(state.value).to.emitSequence([newValue]);
    });

    should('do nothing if there are no given mutable states', () => {
      const value = 123;
      const state = {
        id: 'id',
        value: new BehaviorSubject(value),
      };

      _.tester.bootstrapElement(TEST);

      $onUpdate$.get(_.tester.vine).next(345);

      assert(state.value).to.emitSequence([value]);
    });
  });
});

import {$stateService, source} from 'grapevine';
import {assert, createSpySubject, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {mutableState, MutableState} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, DIV, icall, id, itarget, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, Subject, of, fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../action/action-event';
import {pickAction} from '../action/pick-action';
import {ComponentState} from '../types/component-state';
import {TriggerType} from '../types/trigger-spec';

import {BaseComponent, create$baseComponent} from './base-component';


interface TestState extends ComponentState {
  readonly value: MutableState<number>;
}

const $onUpdate$ = source(() => new Subject<number>());

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
    trigger: icall('trigger', undefinedType),
  },
  shadow: {
    div: id('div', DIV, {
      target: itarget(),
    }),
  },
};

class TestComponent extends BaseComponent<TestState> {
  constructor(
      private readonly $: Context<typeof $test>,
  ) {
    super($);
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      $onUpdate$.get(this.$.vine).pipe(this.updateState(resolver => resolver.$('value'))),
      this.installAction(
          pickAction,
          this.$.shadow.div.target,
          of({type: TriggerType.CLICK}),
          this.$.host.trigger,
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: TestComponent,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div"></div>',
});

// const KEY = TriggerType.T;

test('@protoboard2/src/core/base-component', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});

    return {tester};
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
});

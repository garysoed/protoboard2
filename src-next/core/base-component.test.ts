import {$stateService, source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {mutableState, MutableState} from 'gs-tools/export/state';
import {Context, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, Subject} from 'rxjs';

import {ComponentState} from '../types/component-state';

import {BaseComponent, create$baseComponent} from './base-component';


// const ACTION_NAME = 'test';

// function testAction(trigger: TriggerSpec, context: PersonaContext): ActionSpec {
//   const config$ = of({
//     value: 0,
//     trigger,
//   });
//   return {
//     action: () => EMPTY,
//     actionName: ACTION_NAME,
//     triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
//     trigger$: config$.pipe(createTrigger(context)),
//   };
// }

interface TestState extends ComponentState {
  readonly value: MutableState<number>;
}

const $onUpdate$ = source(() => new Subject<number>());

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
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
    ];
  }

  // @cache()
  // protected get actions(): readonly ActionSpec[] {
  //   return this.triggerActions;
  // }
}

const TEST = registerCustomElement({
  ctrl: TestComponent,
  spec: $test,
  tag: 'pbt-test',
  template: '',
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
      const $state = stateService.addRoot(mutableState({
        id: 'id',
        value: mutableState(123),
      }));

      const element = _.tester.createElement(TEST);
      element.state = stateService.$($state);

      const newValue = 345;
      $onUpdate$.get(_.tester.vine).next(newValue);

      assert(stateService.$($state).$('value')).to.emitSequence([newValue]);
    });

    should('do nothing if there are no given mutable states', () => {
      const stateService = $stateService.get(_.tester.vine);
      const value = 123;
      const $state = stateService.addRoot(mutableState({
        id: 'id',
        value: mutableState(value),
      }));

      _.tester.createElement(TEST);

      $onUpdate$.get(_.tester.vine).next(345);

      assert(stateService.$($state).$('value')).to.emitSequence([value]);
    });
  });

  // test('objectId$', () => {
  //   should('emit the object ID if exists', () => {
  //     const stateService = new StateService();
  //     const objectId = stateService.addRoot({});
  //     const objectPath = stateService.immutablePath(objectId);
  //     _.el.setAttribute('object-path', $api.objectId.createAttributePair(objectPath)[1]);

  //     const objectId$ = createSpySubject(_.component.objectPath$);
  //     assert(objectId$.pipe(map(({id}) => id))).to.emitSequence([objectPath.id]);
  //   });
  // });

  // test('setupAction', () => {
  //   should('set up the help action', () => {
  //     const helpContent$ = createSpySubject(fromEvent<ShowHelpEvent>(_.el, SHOW_HELP_EVENT).pipe(
  //         map(event => event.contents),
  //     ));

  //     triggerKey(
  //         _.el,
  //         {
  //           key: TriggerType.QUESTION,
  //           altKey: false,
  //           ctrlKey: false,
  //           metaKey: false,
  //           shiftKey: true,
  //         },
  //     );

  //     assert(helpContent$).to.emitSequence([
  //       arrayThat<HelpContent>().haveExactElements([
  //         objectThat<HelpContent>().haveProperties({
  //           tag: 'DIV',
  //           actions: arrayThat<ActionTrigger>().haveExactElements([
  //             objectThat<ActionTrigger>().haveProperties({
  //               trigger: objectThat<TriggerSpec>().haveProperties({
  //                 type: TriggerType.CLICK,
  //               }),
  //               actionName: ACTION_NAME,
  //             }),
  //             objectThat<ActionTrigger>().haveProperties({
  //               trigger: objectThat<TriggerSpec>().haveProperties({
  //                 type: KEY,
  //               }),
  //               actionName: ACTION_NAME,
  //             }),
  //           ]),
  //         }),
  //       ]),
  //     ]);
  //   });
  // });
});

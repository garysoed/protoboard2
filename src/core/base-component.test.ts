import {assert, createSpySubject, objectThat, run, runEnvironment, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {extend} from 'gs-tools/export/rxjs';
import {StateService} from 'gs-tools/export/state';
import {$div, element, host, integerParser, PersonaContext} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {PieceSpec} from '../types/piece-spec';

import {ActionContext, BaseAction, OperatorContext, TriggerEvent} from './base-action';
import {$baseComponent, ActionSpec, BaseComponent} from './base-component';
import {TriggerType} from './trigger-spec';


const ACTION_KEY = 'test';
const DEFAULT_CONFIG_VALUE = 234;

interface ActionConfig {
  readonly value: number;
}

interface TestValue {
  readonly event: TriggerEvent;
  readonly config: ActionConfig;
}

class TestAction extends BaseAction<PieceSpec<{}>, ActionConfig> {
  readonly onTrigger$ = new Subject<TestValue>();

  constructor(context: ActionContext<PieceSpec<{}>>) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, context);
  }

  getOperator(context: OperatorContext<ActionConfig>): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        withLatestFrom(context.config$.pipe(extend({value: DEFAULT_CONFIG_VALUE}))),
        tap(([event, config]) => {
          this.onTrigger$.next({event, config});
        }),
    );
  }
}

const $ = {
  host: host($baseComponent.api),
};

class TestComponent extends BaseComponent<PieceSpec<{}>, typeof $> {
  constructor(
      triggerActionMap: ReadonlyArray<ActionSpec<PieceSpec<{}>>>,
      context: PersonaContext,
  ) {
    super(triggerActionMap, context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

const KEY = TriggerType.T;

test('@protoboard2/core/base-component', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const $targetEl = element('target', $div, {});
    const el = document.createElement('div');
    const targetEl = document.createElement('div');
    targetEl.id = 'target';
    const shadowRoot = el.attachShadow({mode: 'open'});
    shadowRoot.appendChild(targetEl);

    const personaContext = createFakeContext({shadowRoot});
    const component = new TestComponent(
        [
          {
            trigger: {type: TriggerType.CLICK, targetEl: $targetEl},
            provider: context => new TestAction(context),
          },
          {
            trigger: {type: KEY, targetEl: $targetEl},
            provider: context => new TestAction(context),
          },
        ],
        personaContext,
    );
    run(component.run());

    return {component, el, personaContext, targetEl};
  });

  test('createTriggerClick', () => {
    should('trigger click based actions', () => {
      const onTrigger$ = createSpySubject(
          ([..._.component.actionsMap].find(([{type}]) => type === TriggerType.CLICK)![1] as TestAction).onTrigger$,
      );
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('createTriggerKey', _, init => {
    const _ = init(_ => {
      const onTrigger$ = createSpySubject(
          ([..._.component.actionsMap].find(([{type}]) => type === KEY)![1] as TestAction).onTrigger$,
      );

      return {
        ..._,
        onTrigger$,
      };
    });

    should('emit when hovered and the correct key was pressed', () => {
      // Hover over the element.
      _.targetEl.dispatchEvent(new CustomEvent('mouseenter'));
      _.targetEl.dispatchEvent(Object.assign(
          new CustomEvent('mousemove'),
          {offsetX: 12, offsetY: 34},
      ));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$.pipe(map(({event}) => event))).to
          .emitWith(objectThat<TriggerEvent>().haveProperties({mouseX: 12, mouseY: 34}));
    });

    should('not emit when the wrong key was pressed', () => {
      // Hover over the element.
      _.targetEl.dispatchEvent(new CustomEvent('mouseenter'));
      _.targetEl.dispatchEvent(Object.assign(
          new CustomEvent('mousemove'),
          {offsetX: 12, offsetY: 34},
      ));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(_.onTrigger$).toNot.emit();
    });

    should('not emit when not hovered', () => {
      // Hover over the element, then hover off.
      _.targetEl.dispatchEvent(new CustomEvent('mouseenter'));
      _.targetEl.dispatchEvent(new CustomEvent('mouseleave'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).toNot.emit();
    });
  });

  test('objectId$', () => {
    should('emit the object ID if exists', () => {
      const stateService = new StateService();
      const objectId = stateService.modify(x => x.add(fakePieceSpec({payload: {}})));
      _.el.setAttribute('object-id', $baseComponent.api.objectId.createAttributePair(objectId)[1]);

      const objectId$ = createSpySubject(_.component.objectId$);
      assert(objectId$.pipe(map(({id}) => id))).to.emitSequence([objectId.id]);
    });
  });

  test('setupTrigger', _, () => {
    should('trigger if modifiers match', () => {
      const component = new TestComponent(
          [
            {
              trigger: {type: KEY, alt: true, ctrl: true, meta: true, shift: true},
              provider: context => new TestAction(context)},
          ],
          _.personaContext,
      );
      run(component.run());

      const onTrigger$ = createSpySubject(
          ([...component.actionsMap].find(([{type}]) => type === KEY)![1] as TestAction).onTrigger$,
      );

      // Hover over the element.
      _.el.dispatchEvent(new CustomEvent('mouseenter'));
      _.el.dispatchEvent(Object.assign(
          new CustomEvent('mousemove'),
          {offsetX: 12, offsetY: 34},
      ));

      // Press the key
      window.dispatchEvent(new KeyboardEvent(
          'keydown',
          {
            key: KEY,
            altKey: true,
            ctrlKey: true,
            metaKey: true,
            shiftKey: true,
          },
      ));

      assert(onTrigger$.pipe(map(({event}) => event))).to
          .emitWith(objectThat<TriggerEvent>().haveProperties({mouseX: 12, mouseY: 34}));
    });

    should('default modifiers to false', () => {
      const component = new TestComponent(
          [
            {
              trigger: {type: KEY},
              provider: context => new TestAction(context)},
          ],
          _.personaContext,
      );
      run(component.run());

      const onTrigger$ = createSpySubject(
          ([...component.actionsMap].find(([{type}]) => type === KEY)![1] as TestAction).onTrigger$,
      );

      // Hover over the element.
      _.el.dispatchEvent(new CustomEvent('mouseenter'));
      _.el.dispatchEvent(Object.assign(
          new CustomEvent('mousemove'),
          {offsetX: 12, offsetY: 34},
      ));

      // Press the key
      window.dispatchEvent(new KeyboardEvent(
          'keydown',
          {
            key: KEY,
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
          },
      ));

      assert(onTrigger$.pipe(map(({event}) => event))).to
          .emitWith(objectThat<TriggerEvent>().haveProperties({mouseX: 12, mouseY: 34}));
    });
  });

  test('getConfig$', _, init => {
    const _ = init(_ => {
      const action = ([..._.component.actionsMap].find(([{type}]) => type === TriggerType.CLICK)![1] as TestAction);
      const value$ = createSpySubject(action.onTrigger$ .pipe(map(({config}) => config.value)));
      return {..._, action, value$};
    });

    should('update the configuration when attribute is specified', () => {
      _.el.setAttribute('pb-test-value', '123');
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([123]);
    });

    should('use the default config if config attribute does not exist', () => {
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([DEFAULT_CONFIG_VALUE]);
    });

    should('update the configuration when attribute has changed', () => {
      _.el.setAttribute('pb-test-value', '123');
      _.el.setAttribute('pb-test-value', '345');
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([345]);
    });

    should('update the trigger configuration correctly', () => {
      _.el.setAttribute('pb-test-trigger', 'click');
      _.el.setAttribute('pb-test-value', '345');

      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([345]);
    });
  });
});

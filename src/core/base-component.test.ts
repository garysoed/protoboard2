import {assert, createSpySubject, objectThat, run, runEnvironment, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {StateService} from 'gs-tools/export/state';
import {$div, attributeIn, element, host, integerParser, PersonaContext} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {Observable, pipe, Subject} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext} from '../action/action-context';
import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {PieceSpec} from '../types/piece-spec';

import {$baseComponent, BaseComponent} from './base-component';
import {TriggerEvent} from './trigger-event';
import {triggerSpecParser, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


interface ActionConfig extends TriggerConfig {
  readonly value: number;
}

interface TestValue {
  readonly event: TriggerEvent;
  readonly config: ActionConfig;
}

function testAction(
    onTrigger$: Subject<TestValue>,
    trigger: UnreservedTriggerSpec,
    attrName: string,
): ActionSpec<ActionConfig> {
  return {
    action: (context: ActionContext<PieceSpec<{}>, ActionConfig>) => pipe(
        withLatestFrom(context.config$),
        tap(([event, config]) => {
          onTrigger$.next({event, config});
        }),
    ),
    actionName: 'test',
    configSpecs: {
      value: attributeIn(attrName, integerParser(), 0),
      trigger: attributeIn('pb-test-trigger', triggerSpecParser(), trigger),
    },
  };
}

const $ = {
  host: host($baseComponent.api),
};

class TestComponent extends BaseComponent<PieceSpec<{}>, typeof $> {
  constructor(
      triggerActionMap: ReadonlyArray<ActionSpec<any>>,
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
    const onClick$ = new Subject<TestValue>();
    const onKey$ = new Subject<TestValue>();
    const component = new TestComponent(
        [
          testAction(
              onClick$,
              {type: TriggerType.CLICK, targetEl: $targetEl},
              'pb-test-value',
          ),
          testAction(
              onKey$,
              {type: KEY, targetEl: $targetEl},
              'pb-test2-value',
          ),
        ],
        personaContext,
    );
    run(component.run());

    return {
      component,
      el,
      onClick$,
      onKey$,
      personaContext,
      targetEl,
    };
  });

  test('createTriggerClick', () => {
    should('trigger click based actions', () => {
      const onTrigger$ = createSpySubject(_.onClick$);
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('createTriggerKey', _, init => {
    const _ = init(_ => {
      const onTrigger$ = createSpySubject(_.onKey$);

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
      const onActionTrigger$ = new Subject<TestValue>();
      const component = new TestComponent(
          [
            testAction(
                onActionTrigger$,
                {type: KEY, alt: true, ctrl: true, meta: true, shift: true},
                'pb-test',
            ),
          ],
          _.personaContext,
      );
      run(component.run());

      const onTrigger$ = createSpySubject(onActionTrigger$);

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
      const onActionTrigger$ = new Subject<TestValue>();
      const component = new TestComponent(
          [
            testAction(
                onActionTrigger$,
                {type: KEY},
                'pb-test',
            ),
          ],
          _.personaContext,
      );
      run(component.run());

      const onTrigger$ = createSpySubject(onActionTrigger$);

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
      const value$ = createSpySubject(_.onClick$.pipe(map(({config}) => config.value)));
      return {..._, value$};
    });

    should('update the configuration when attribute is specified', () => {
      _.el.setAttribute('pb-test-value', '123');
      _.personaContext.onAttributeChanged$.next({attrName: 'pb-test-value'});
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([123]);
    });

    should('update the configuration when attribute has changed', () => {
      _.el.setAttribute('pb-test-value', '123');
      _.personaContext.onAttributeChanged$.next({attrName: 'pb-test-value'});
      _.el.setAttribute('pb-test-value', '345');
      _.personaContext.onAttributeChanged$.next({attrName: 'pb-test-value'});
      _.targetEl.dispatchEvent(new MouseEvent('click'));

      assert(_.value$).to.emitSequence([345]);
    });
  });
});

import { Vine } from 'grapevine';
import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { _v } from 'mask';
import { AttributeChangedEvent, PersonaContext } from 'persona';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import { BaseAction } from './base-action';
import { BaseComponent } from './base-component';
import { TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';


const ACTION_KEY = 'test';

class TestAction extends BaseAction {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(vine: Vine) {
    super(ACTION_KEY, 'Test', {}, vine);
  }

  get onTriggerOut$(): Observable<unknown> {
    return this.onTrigger$;
  }
}

class TestComponent extends BaseComponent {
  constructor(
      triggerActionMap: ReadonlyMap<UnreservedTriggerSpec, BaseAction>,
      context: PersonaContext,
  ) {
    super(triggerActionMap, context);
  }
}

const KEY = TriggerSpec.T;

test('@protoboard2/core/base-component', init => {
  const _ = init(() => {
    const element = document.createElement('div');
    const styleEl = document.createElement('style');
    styleEl.id = 'theme';
    const shadowRoot = element.attachShadow({mode: 'open'});
    shadowRoot.appendChild(styleEl);

    const vine = _v.build('test');
    const clickAction = new TestAction(vine);
    const keyAction = new TestAction(vine);

    const component = new TestComponent(
        new Map<UnreservedTriggerSpec, BaseAction>([
          [TriggerSpec.CLICK, clickAction],
          [KEY, keyAction],
        ]),
        {
          shadowRoot,
          vine,
          onAttributeChanged$: new Subject<AttributeChangedEvent>(),
        },
    );
    run(component.run());

    return {
      clickAction,
      component,
      element,
      keyAction,
    };
  });

  test('createTriggerClick', () => {
    should(`trigger click based actions`, () => {
      const onTrigger$ = createSpySubject(_.clickAction.onTrigger$);
      _.element.dispatchEvent(new CustomEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('createTriggerKey', _, init => {
    const _ = init(_ => {
      const onTrigger$ = createSpySubject(_.keyAction.onTrigger$);

      return {
        ..._,
        onTrigger$,
      };
    });

    should(`emit when hovered and the correct key was pressed`, () => {
      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).to.emit();
    });

    should(`not emit when the wrong key was pressed`, () => {
      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(_.onTrigger$).toNot.emit();
    });

    should(`not emit when not hovered`, () => {
      // Hover over the element, then hover off.
      _.element.dispatchEvent(new CustomEvent('mouseover'));
      _.element.dispatchEvent(new CustomEvent('mouseout'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).toNot.emit();
    });
  });

  test('setupTriggerFunction', () => {
    should(`create a function that triggers`, () => {
      const onTrigger$ = createSpySubject(_.keyAction.onTrigger$);

      (_.element as any)[ACTION_KEY]();

      assert(onTrigger$).to.emit();
    });
  });
});

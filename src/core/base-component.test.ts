import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { PersonaContext } from 'persona';
import { createFakeContext } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';

import { ActionContext, BaseAction } from './base-action';
import { BaseActionCtor, BaseComponent } from './base-component';
import { TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(context: ActionContext<{}>) {
    super(ACTION_KEY, 'Test', {}, context);
  }

  get onTriggerOut$(): Observable<unknown> {
    return this.onTrigger$;
  }

  get objectId$(): Observable<string> {
    return this.context.objectId$;
  }
}

class TestComponent extends BaseComponent<{}> {
  constructor(
      triggerActionMap: ReadonlyMap<UnreservedTriggerSpec, BaseActionCtor<{}, {}>>,
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

    const personaContext = createFakeContext({shadowRoot});
    const component = new TestComponent(
        new Map([
          [TriggerSpec.CLICK, context => new TestAction(context)],
          [KEY, context => new TestAction(context)],
        ]),
        personaContext,
    );
    run(component.run());

    return {component, element};
  });

  test('createTriggerClick', () => {
    should(`trigger click based actions`, () => {
      const onTrigger$ = createSpySubject(
          _.component.actionsMap.get(TriggerSpec.CLICK)!.onTrigger$,
      );
      _.element.dispatchEvent(new CustomEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('createTriggerKey', _, init => {
    const _ = init(_ => {
      const onTrigger$ = createSpySubject(_.component.actionsMap.get(KEY)!.onTrigger$);

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

  test('objectId$', () => {
    should(`emit the object ID if exists`, () => {
      const objectId = 'objectId';
      _.element.setAttribute('object-id', objectId);

      const objectId$ = createSpySubject((_.component.actionsMap.get(KEY) as TestAction).objectId$);
      assert(objectId$).to.emitSequence([objectId]);
    });

    should(`emit nothing if the object ID does not exist`, () => {
      const objectId$ = createSpySubject((_.component.actionsMap.get(KEY) as TestAction).objectId$);
      assert(objectId$).to.emitSequence([]);
    });
  });

  test('setupTriggerFunction', () => {
    should(`create a function that triggers`, () => {
      const onTrigger$ = createSpySubject(_.component.actionsMap.get(KEY)!.onTrigger$);

      (_.element as any)[ACTION_KEY]();

      assert(onTrigger$).to.emit();
    });
  });
});

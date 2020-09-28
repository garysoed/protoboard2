import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { $pipe } from 'gs-tools/export/collect';
import { host, PersonaContext } from 'persona';
import { createFakeContext } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';

import { ActionContext, BaseAction } from './base-action';
import { ActionSpec, BaseComponent } from './base-component';
import { TriggerType } from './trigger-spec';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(context: ActionContext<{}>) {
    super(ACTION_KEY, 'Test', {}, context, {});
  }

  get onTriggerOut$(): Observable<unknown> {
    return this.onTrigger$;
  }
}

class TestComponent extends BaseComponent<{}> {
  constructor(
      triggerActionMap: ReadonlyArray<ActionSpec<{}>>,
      context: PersonaContext,
  ) {
    super(triggerActionMap, context, host({}));
  }
}

const KEY = TriggerType.T;

test('@protoboard2/core/base-component', init => {
  const _ = init(() => {
    const element = document.createElement('div');
    const styleEl = document.createElement('style');
    styleEl.id = 'theme';
    const shadowRoot = element.attachShadow({mode: 'open'});
    shadowRoot.appendChild(styleEl);

    const personaContext = createFakeContext({shadowRoot});
    const component = new TestComponent(
        [
          {trigger: TriggerType.CLICK, provider: context => new TestAction(context)},
          {trigger: KEY, provider: context => new TestAction(context)},
        ],
        personaContext,
    );
    run(component.run());

    return {component, element, personaContext};
  });

  test('createTriggerClick', () => {
    should(`trigger click based actions`, () => {
      const onTrigger$ = createSpySubject(
          [..._.component.actionsMap].find(([{type}]) => type === TriggerType.CLICK)![1].onTrigger$,
      );
      _.element.dispatchEvent(new MouseEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('createTriggerKey', _, init => {
    const _ = init(_ => {
      const onTrigger$ = createSpySubject(
          [..._.component.actionsMap].find(([{type}]) => type === KEY)![1].onTrigger$,
      );

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

      const objectId$ = createSpySubject(_.component.objectId$);
      assert(objectId$).to.emitSequence([objectId]);
    });

    should(`emit nothing if the object ID does not exist`, () => {
      const objectId$ = createSpySubject(_.component.objectId$);
      assert(objectId$).to.emitSequence([]);
    });
  });

  test('setupTrigger', _, () => {
    should(`trigger if modifiers match`, () => {
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
          [...component.actionsMap].find(([{type}]) => type === KEY)![1].onTrigger$,
      );

      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

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
      assert(onTrigger$).to.emit();
    });

    should(`default modifiers to false`, () => {
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
          [...component.actionsMap].find(([{type}]) => type === KEY)![1].onTrigger$,
      );

      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

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
      assert(onTrigger$).to.emit();
    });
  });

  test('setupTriggerFunction', () => {
    should(`create a function that triggers`, () => {
      const onTrigger$ = createSpySubject(
          [..._.component.actionsMap].find(([{type}]) => type === KEY)![1].onTrigger$,
      );

      (_.element as any)[ACTION_KEY]();

      assert(onTrigger$).to.emit();
    });
  });
});

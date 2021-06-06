import {assert, createSpySubject, objectThat, should, test} from 'gs-testing';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerEvent} from '../../core/trigger-event';
import {TriggerType} from '../../core/trigger-spec';
import {triggerClick} from '../testing/trigger-click';
import {triggerKey} from '../testing/trigger-key';

import {createTrigger} from './setup-trigger';


test('@protoboard2/src/action/util/setup-trigger', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context, el};
  });

  test('createTriggerClick', () => {
    should('trigger click based actions', () => {
      const onTrigger$ = createSpySubject(
          of({trigger: {type: TriggerType.CLICK}}).pipe(createTrigger(_.context)),
      );

      triggerClick(_.el);

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({
        mouseX: 0,
        mouseY: 0,
      }),
      );
    });
  });

  test('createTriggerKey', () => {
    should('emit when hovered and the correct key was pressed', () => {
      const onTrigger$ = createSpySubject(
          of({trigger: {type: TriggerType.T}}).pipe(createTrigger(_.context)),
      );

      const mouseX = 12;
      const mouseY = 34;
      triggerKey(
          _.el,
          {
            key: TriggerType.T,
            mouseX,
            mouseY,
          },
      );

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({
        mouseX,
        mouseY,
      }));
    });

    should('not emit when the wrong key was pressed', () => {
      const onTrigger$ = createSpySubject(of({trigger: {type: TriggerType.T}}).pipe(
          createTrigger(_.context),
      ));

      const mouseX = 12;
      const mouseY = 34;
      triggerKey(
          _.el,
          {
            key: TriggerType.O,
            mouseX,
            mouseY,
          },
      );

      assert(onTrigger$).toNot.emit();
    });

    should('not emit when not hovered', () => {
      const onTrigger$ = createSpySubject(of({trigger: {type: TriggerType.T}}).pipe(
          createTrigger(_.context),
      ));

      // Hover over the element, then hover off.
      _.el.dispatchEvent(new CustomEvent('mouseenter'));
      _.el.dispatchEvent(new CustomEvent('mouseleave'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: TriggerType.T}));

      assert(onTrigger$).toNot.emit();
    });
  });


  test('createTrigger', () => {
    should('trigger if modifiers match', () => {
      const onTrigger$ = createSpySubject(
          of({
            trigger: {
              type: TriggerType.T,
              alt: true,
              ctrl: true,
              meta: true,
              shift: true,
            },
          }).pipe(
              createTrigger(_.context),
          ),
      );

      const mouseX = 12;
      const mouseY = 34;
      triggerKey(
          _.el,
          {
            key: TriggerType.T,
            altKey: true,
            ctrlKey: true,
            metaKey: true,
            shiftKey: true,
            mouseX,
            mouseY,
          },
      );

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({mouseX, mouseY}));
    });

    should('default modifiers to false', () => {
      const onTrigger$ = createSpySubject(of({trigger: {type: TriggerType.T}}).pipe(
          createTrigger(_.context),
      ));

      const mouseX = 12;
      const mouseY = 34;
      triggerKey(
          _.el,
          {
            key: TriggerType.T,
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            mouseX,
            mouseY,
          },
      );

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({mouseX, mouseY}));
    });
  });
});
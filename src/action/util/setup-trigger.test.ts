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
      const config = {
        trigger: {type: TriggerType.CLICK, alt: true, meta: true},
      };
      const onTrigger$ = createSpySubject(of(config).pipe(createTrigger(_.context)));

      const altKey = true;
      const ctrlKey = false;
      const metaKey = true;
      const shiftKey = false;
      const mouseX = 12;
      const mouseY = 34;
      triggerClick(
          _.el,
          {
            altKey,
            ctrlKey,
            metaKey,
            mouseX,
            mouseY,
            shiftKey,
          },
      );

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({
        altKey,
        ctrlKey,
        metaKey,
        mouseX,
        mouseY,
        shiftKey,
        targetEl: _.el,
      }),
      );
    });
  });

  test('createTriggerKey', () => {
    should('emit when hovered and the correct key was pressed', () => {
      const config = {
        trigger: {type: TriggerType.T, alt: true, meta: true},
      };
      const onTrigger$ = createSpySubject(of(config).pipe(createTrigger(_.context)));

      const altKey = true;
      const ctrlKey = false;
      const metaKey = true;
      const shiftKey = false;
      const mouseX = 12;
      const mouseY = 34;
      triggerKey(
          _.el,
          {
            key: TriggerType.T,
            altKey,
            ctrlKey,
            metaKey,
            mouseX,
            mouseY,
            shiftKey,
          },
      );

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({
        altKey,
        ctrlKey,
        metaKey,
        mouseX,
        mouseY,
        shiftKey,
        targetEl: _.el,
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

    should('only emit on the inner component', () => {
      const elParent = document.createElement('div');
      const shadowRootParent = elParent.attachShadow({mode: 'open'});
      const contextParent = createFakeContext({shadowRoot: shadowRootParent});

      const config = {
        trigger: {type: TriggerType.T},
      };
      const onTrigger$ = createSpySubject(of(config).pipe(createTrigger(_.context)));
      const onTriggerParent$ = createSpySubject(of(config).pipe(createTrigger(contextParent)));

      elParent.appendChild(_.el);

      const mouseX = 12;
      const mouseY = 34;
      triggerKey(_.el, {key: TriggerType.T, mouseX, mouseY});

      assert(onTrigger$).to.emitWith(objectThat<TriggerEvent>().haveProperties({
        mouseX,
        mouseY,
        targetEl: _.el,
      }));
      assert(onTriggerParent$).toNot.emit();
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
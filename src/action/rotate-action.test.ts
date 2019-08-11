import { Vine } from '@grapevine';
import { assert, setup, should, test } from '@gs-testing';
import { _v } from '@mask';

import { RotateAction } from './rotate-action';

test('@protoboard2/action/rotate-action', () => {
  let el: HTMLElement;
  let vine: Vine;

  setup(() => {
    el = document.createElement('div');
    vine = _v.build('test');
  });

  test('onConfig', () => {
    should(`change the index when updated`, () => {
      const action = new RotateAction(0, [1, 2, 3]);
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'rotate');
      configEl.setAttribute('index', '2');
      el.appendChild(configEl);

      assert(el.style.transform).to.equal('rotateZ(3deg)');
    });

    should(`change the stops when updated`, () => {
      const action = new RotateAction(1, []);
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'rotate');
      configEl.setAttribute('stops', '[12 34 45]');
      el.appendChild(configEl);

      assert(el.style.transform).to.equal('rotateZ(34deg)');
    });
  });

  test('onTrigger', () => {
    should(`change the rotation`, () => {
      const action = new RotateAction(1, [11, 22, 33]);
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      // Trigger the action.
      el.dispatchEvent(new CustomEvent('mouseover'));
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'r'}));

      assert(el.style.transform).to.equal('rotateZ(33deg)');
    });
  });

  test('setupHandleNewIndex', () => {
    should(`should handle cycling`, () => {
      const action = new RotateAction(2, [11, 22, 33]);
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      // Trigger the action.
      el.dispatchEvent(new CustomEvent('mouseover'));
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'r'}));

      assert(el.style.transform).to.equal('rotateZ(11deg)');
    });
  });
});

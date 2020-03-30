import { assert, should, test } from 'gs-testing';
import { arrayFrom } from 'gs-tools/export/collect';
import { _v } from 'mask';

import { ReverseAction } from './reverse-action';

test('@protoboard2/action/reverse-action', () => {
  test('setupHandleTrigger', () => {
    should(`reverse the child elements`, () => {
      const rootEl = document.createElement('div');
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      rootEl.appendChild(child1);
      rootEl.appendChild(child2);
      rootEl.appendChild(child3);

      const shadowRoot = rootEl.attachShadow({mode: 'open'});
      const vine = _v.build('test');
      const action = new ReverseAction(vine);
      action.setActionTarget(shadowRoot);

      action.trigger();

      assert(arrayFrom(rootEl.children)).to.haveExactElements([child3, child2, child1]);
    });
  });
});

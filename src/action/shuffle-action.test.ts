import { assert, should, test } from 'gs-testing';
import { FakeSeed, fromSeed } from 'gs-tools/export/random';
import { _v } from 'mask';
import { $random } from 'src/util/random';

import { trigger } from '../testing/component-tester';

import { ShuffleAction } from './shuffle-action';


test('@protoboard2/action/shuffle', () => {
  test('ShuffleAction', () => {
    should(`shuffle the child elements correctly`, () => {
      const rootEl = document.createElement('div');
      const shadowRoot = rootEl.attachShadow({mode: 'open'});
      const childEl1 = document.createElement('child1');
      const childEl2 = document.createElement('child2');
      const childEl3 = document.createElement('child3');

      rootEl.appendChild(childEl1);
      rootEl.appendChild(childEl2);
      rootEl.appendChild(childEl3);

      const seed = new FakeSeed([1, 0, 0.5]);
      const vine = _v.build('test');
      $random.get(vine).next(fromSeed(seed));

      const action = new ShuffleAction();
      action.install({shadowRoot, vine}).subscribe();

      trigger(rootEl, action);

      assert(rootEl.children.item(0)).to.equal(childEl2);
      assert(rootEl.children.item(1)).to.equal(childEl3);
      assert(rootEl.children.item(2)).to.equal(childEl1);
    });
  });
});

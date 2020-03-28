import { assert, should, test } from 'gs-testing';
import { _v } from 'mask';

import { configure, trigger } from '../testing/component-tester';

import { $$ as $flipAction, FlipAction } from './flip-action';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    const action = new FlipAction(2, 0);
    const vine = _v.build('test');

    const el = document.createElement('div');
    action.install(el.attachShadow({mode: 'open'}), vine).subscribe();

    return {action, el, vine};
  });

  test('onTrigger', () => {
    should(`increase the face by 1`, () => {
      trigger(_.el, _.action);

      assert(_.el.getAttribute($flipAction.currentFace.attrName)).to.equal('1');
    });
  });

  test('onConfig', () => {
    should(`read the configs correctly`, () => {
      configure(_.el, _.action.key, new Map([['count', '4'], ['index', '10']]));

      assert(_.el.getAttribute($flipAction.currentFace.attrName)).to.equal('2');
    });
  });

  test('setupOnSetIndex', () => {
    should(`wrap the face index by the count`, () => {
      trigger(_.el, _.action);
      trigger(_.el, _.action);

      assert(_.el.getAttribute($flipAction.currentFace.attrName)).to.equal('0');
    });
  });
});

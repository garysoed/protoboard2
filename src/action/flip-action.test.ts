import { assert, should, test } from 'gs-testing';
import { _v } from 'mask';

import { configure } from '../testing/component-tester';

import { $$ as $flipAction, FlipAction } from './flip-action';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    const vine = _v.build('test');
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const action = new FlipAction(2, 0, vine);
    action.setActionTarget(shadowRoot);

    return {action, el, vine};
  });

  test('onTrigger', () => {
    should(`increase the face by 1`, () => {
      _.action.trigger();

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
      _.action.trigger();
      _.action.trigger();

      assert(_.el.getAttribute($flipAction.currentFace.attrName)).to.equal('0');
    });
  });
});

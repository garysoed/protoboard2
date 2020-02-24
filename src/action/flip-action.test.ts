import { Vine } from 'grapevine';
import { assert, setup, should, test } from 'gs-testing';
import { _v } from 'mask';
import { repeat, take } from 'rxjs/operators';

import { configure, trigger } from '../testing/component-tester';

import { $$ as $flipAction, FlipAction } from './flip-action';


test('@protoboard2/action/flip-action', () => {
  let action: FlipAction;
  let vine: Vine;

  setup(() => {
    action = new FlipAction(2, 0);
    vine = _v.build('test');
  });

  test('onTrigger', () => {
    should(`increase the face by 1`, () => {
      const el = document.createElement('div');
      action.install(el.attachShadow({mode: 'open'}), vine).subscribe();

      action.triggerSpec$.pipe(trigger(el), take(1)).subscribe();

      assert(el.getAttribute($flipAction.currentFace.attrName)).to.equal('1');
    });
  });

  test('onConfig', () => {
    should(`read the configs correctly`, () => {
      const el = document.createElement('div');
      action.install(el.attachShadow({mode: 'open'}), vine).subscribe();

      configure(el, action.key, new Map([['count', '4'], ['index', '10']]));

      assert(el.getAttribute($flipAction.currentFace.attrName)).to.equal('2');
    });
  });

  test('setupOnSetIndex', () => {
    should(`wrap the face index by the count`, () => {
      const el = document.createElement('div');
      action.install(el.attachShadow({mode: 'open'}), vine).subscribe();

      action.triggerSpec$.pipe(trigger(el), take(1), repeat(2)).subscribe();

      assert(el.getAttribute($flipAction.currentFace.attrName)).to.equal('0');
    });
  });
});

import { assert, init, should, test } from 'gs-testing';
import { FakeSeed } from 'gs-tools/export/random';
import { _v } from 'mask';

import { configure, trigger } from '../testing/component-tester';

import { $$ as $rollAction, RollAction } from './roll-action';


test('@protoboard2/action/roll-action', () => {
  const _ = init(() => {
    const seed = new FakeSeed();
    const action = new RollAction({count: 3}, seed);

    const el = document.createElement('div');
    action.install(el.attachShadow({mode: 'open'}), _v.build('test')).subscribe();

    return {action, el, seed};
  });

  test('onConfig', () => {
    should(`change the count correctly`, () => {
      configure(_.el, _.action.key, new Map([['count', '4']]));
      _.seed.values = [1];

      trigger(_.el, _.action);
      assert(_.el.getAttribute($rollAction.currentFace.attrName)).to.equal('4');
    });
  });

  test('onTrigger', () => {
    should(`change the current face correctly`, () => {
      _.seed.values = [1];

      trigger(_.el, _.action);

      assert(_.el.getAttribute($rollAction.currentFace.attrName)).to.equal('3');
    });
  });
});

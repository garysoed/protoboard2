import { assert, run, should, test } from 'gs-testing';
import { FakeSeed, fromSeed } from 'gs-tools/export/random';
import { _v } from 'mask';

import { configure } from '../testing/component-tester';
import { $random } from '../util/random';

import { $face } from './face';
import { RollAction } from './roll-action';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});

    const vine = _v.build('test');
    const seed = new FakeSeed();
    $random.set(vine, () => fromSeed(seed));
    const action = new RollAction({count: 3}, vine);
    action.setActionTarget(shadowRoot);
    run(action.run());

    return {action, el, seed};
  });

  test('onConfig', () => {
    should(`change the count correctly`, () => {
      configure(_.el, _.action.key, new Map([['count', '4']]));
      _.seed.values = [1];

      _.action.trigger();
      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('4');
    });
  });

  test('onTrigger', () => {
    should(`change the current face correctly`, () => {
      _.seed.values = [1];

      _.action.trigger();

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('3');
    });

    should(`handle the value if changed by other action`, () => {
      _.el.setAttribute($face.currentFaceOut.attrName, '5');

      _.seed.values = [1];
      _.action.trigger();

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('3');
    });
  });
});
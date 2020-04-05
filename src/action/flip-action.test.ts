import { assert, run, should, test } from 'gs-testing';
import { _v } from 'mask';

import { configure } from '../testing/component-tester';

import { $face } from './face';
import { FlipAction } from './flip-action';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    const vine = _v.build('test');
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const action = new FlipAction(2, 0, vine);
    action.setActionTarget(shadowRoot);

    run(action.run());

    return {action, el, vine};
  });

  test('setup', () => {
    should(`render the default face`, () => {
      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('0');
    });

    should(`read the configs correctly`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      configure(el, _.action.key, new Map([['count', '4'], ['index', '10']]));
      const action = new FlipAction(2, 0, _.vine);
      action.setActionTarget(shadowRoot);
      run(action.run());

      assert(el.getAttribute($face.currentFaceOut.attrName)).to.equal('2');
    });

    should(`ignore the config when configured later`, () => {
      configure(_.el, _.action.key, new Map([['count', '4'], ['index', '10']]));

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('0');
    });
  });

  test('trigger', () => {
    should(`increase the face by 1`, () => {
      _.action.trigger();

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('1');
    });

    should(`wrap the face index by the count`, () => {
      _.action.trigger();
      _.action.trigger();

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('0');
    });

    should(`handle the value if changed by other action`, () => {
      _.el.setAttribute($face.currentFaceOut.attrName, '5');

      _.action.trigger();

      assert(_.el.getAttribute($face.currentFaceOut.attrName)).to.equal('0');
    });
  });
});

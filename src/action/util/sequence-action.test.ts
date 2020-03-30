import { assert, should, test } from 'gs-testing';
import { _v } from 'mask';

import { $face } from '../face';
import { FlipAction } from '../flip-action';

import { SequenceAction } from './sequence-action';


test('@protoboard2/action/util/sequence-action', () => {
  test('trigger', () => {
    should(`apply the given actions to the target element`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const vine = _v.build('test');
      const action = new SequenceAction(
          'test',
          'Test',
          [
            new FlipAction(2, 0, vine),
            new FlipAction(3, 0, vine),
          ],
          vine,
      );
      action.setActionTarget(shadowRoot);

      action.trigger();

      // The first flip sets the face to 1, the second sets it to 2. If the flip actions are
      // reversed, the first flip will set to 1, the second will set to 0.
      assert(el.getAttribute($face.currentFaceOut.attrName)).to.equal('2');
    });
  });
});

import { assert, run, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';

import { $, D2 } from './d2';


test('@protoboard2/component/d2', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([D2]);
    const el = tester.createElement('pb-d2', document.body);
    return {el};
  });

  test('renderFaceName', () => {
    should(`render the face name correctly`, () => {
      run(_.el.setAttribute($.host._.currentFaceOut, 2));

      assert(_.el.getAttribute($.face._.name)).to.emitSequence(['face-2']);
    });
  });
});

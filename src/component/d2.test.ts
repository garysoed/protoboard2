import { assert, setup, should, test } from 'gs-testing';
import { _p } from 'mask';
import { ElementTester, PersonaTesterFactory } from 'persona/export/testing';

import { $, D2 } from './d2';


test('@protoboard2/component/d2', () => {
  const factory = new PersonaTesterFactory(_p);

  let el: ElementTester;

  setup(() => {
    const tester = factory.build([D2]);
    el = tester.createElement('pb-d2', document.body);
  });

  test('renderFaceName', () => {
    should(`render the face name correctly`, () => {
      el.setAttribute($.host._.currentFaceOut, 2).subscribe();

      assert(el.getAttribute($.face._.name)).to.emitSequence(['face-2']);
    });
  });
});

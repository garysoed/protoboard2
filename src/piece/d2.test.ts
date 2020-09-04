import { assert, run, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { tap } from 'rxjs/operators';

import { $stateService } from '../state/state-service';

import { $, D2, D2Payload } from './d2';


test('@protoboard2/component/d2', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([D2], document);
    const el = tester.createElement('pb-d2');

    return {el, tester};
  });

  test('faceName$', () => {
    should(`render the face name correctly`, () => {
      const objectId = 'objectId';
      run(_.el.setAttribute($.host._.objectId, objectId));

      const payload: D2Payload = {
        faceIndex: 2,
        rotationIndex: 0,
      };
      run($stateService.get(_.tester.vine).pipe(
          tap(stateService => {
            stateService.setStates(new Set([
              {
                id: objectId,
                type: 'testType',
                payload,
              },
            ]));
          }),
      ));

      assert(_.el.getAttribute($.face._.name)).to.emitSequence(['face-2']);
    });
  });
});

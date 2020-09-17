import { assert, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService, _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';

import { $objectSpecListId } from '../objects/object-spec-list';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

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

      const stateService = new StateService();
      $stateService.set(_.tester.vine, () => stateService);
      const $faceIndex = stateService.add<number>(2);
      const $rotationDeg = stateService.add<number>(0);

      const builder = fakeObjectSpecListBuilder();
      builder.add<D2Payload>({
        id: objectId,
        payload: {$faceIndex, $rotationDeg},
      });
      const $root = stateService.add(builder.build());
      $objectSpecListId.set(_.tester.vine, () => $root);

      assert(_.el.getAttribute($.face._.name)).to.emitSequence(['face-2']);
    });
  });
});

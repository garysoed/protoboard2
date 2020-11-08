import {Vine} from 'grapevine';
import {assert, mapThat, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';

import {ObjectSpec} from '../object-spec';
import {FakeRootStateBuilder} from '../testing/fake-object-spec-list-builder';

import {$objectSpecMap} from './root-state';


test('@protoboard2/objects/getters/root-state', init => {
  const _ = init(() => {
    const vine = new Vine('test');
    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    return {stateService, vine};
  });

  test('$objectSpecMap', () => {
    should('emit the correct map', () => {
      const object1 = 'object1';
      const object2 = 'object2';
      const object3 = 'object3';

      const builder = new FakeRootStateBuilder({});
      const objectSpec1 = builder.add({id: object1, payload: 'object1Payload'});
      const objectSpec2 = builder.add({id: object2, payload: 'object2Payload'});
      const objectSpec3 = builder.add({id: object3, payload: 'object3Payload'});
      builder.build(_.stateService, _.vine);

      assert($objectSpecMap.get(_.vine)).to.emitWith(
          mapThat<string, ObjectSpec<any>>().haveExactElements(new Map([
            [object1, objectSpec1],
            [object2, objectSpec2],
            [object3, objectSpec3],
          ])),
      );
    });

    should('emit empty map if the objectSpecId is not in StateService', () => {
      const builder = new FakeRootStateBuilder({});
      builder.build(_.stateService, _.vine);

      assert($objectSpecMap.get(_.vine)).to.emitWith(
          mapThat<string, ObjectSpec<any>>().haveExactElements(new Map()),
      );
    });
  });
});

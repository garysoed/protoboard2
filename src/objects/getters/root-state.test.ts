import {Vine} from 'grapevine';
import {assert, mapThat, setThat, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {map} from 'rxjs/operators';

import {ObjectSpec} from '../object-spec';
import {FakeRootStateBuilder} from '../testing/fake-object-spec-list-builder';

import {$getObjectSpec, $objectSpecIds, $objectSpecMap} from './root-state';


test('@protoboard2/objects/getters/root-state', init => {
  const _ = init(() => {
    const vine = new Vine('test');
    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    return {stateService, vine};
  });

  test('$getObjectSpec', () => {
    should('emit the object spec', () => {
      const objectId = 'objectId';
      const payload = 'payload';

      const builder = new FakeRootStateBuilder({});
      const objectSpy = builder.add({id: objectId, payload});
      builder.build(_.stateService, _.vine);

      assert($getObjectSpec.get(_.vine).pipe(map(getObjectSpec => getObjectSpec(objectId))))
          .to.emitWith(objectSpy);
    });

    should('emit null if the spec corresponding to the key does not exist', () => {
      const builder = new FakeRootStateBuilder({});
      builder.build(_.stateService, _.vine);

      assert($getObjectSpec.get(_.vine).pipe(map(getObjectSpec => getObjectSpec('objectId'))))
          .to.emitWith(null);
    });
  });

  test('$objectSpecIds', () => {
    should('emit the object IDs', () => {
      const objectId1 = 'objectId1';
      const objectId2 = 'objectId2';
      const objectId3 = 'objectId3';
      const payload = 'payload';

      const builder = new FakeRootStateBuilder({});
      builder.add({id: objectId1, payload});
      builder.add({id: objectId2, payload});
      builder.add({id: objectId3, payload});
      builder.build(_.stateService, _.vine);

      assert($objectSpecIds.get(_.vine)).to.emitWith(
          setThat<string>().haveExactElements(new Set([objectId1, objectId2, objectId3])),
      );
    });
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

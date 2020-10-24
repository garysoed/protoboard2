import { assert, createSpy, fake, resetCalls, setThat, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { NodeWithId, setId } from 'persona';
import { createFakeContext } from 'persona/export/testing';
import { Observable, of as observableOf } from 'rxjs';

import { $objectService, ObjectService } from './object-service';
import { fakeObjectSpecListBuilder } from './testing/fake-object-spec-list-builder';


test('@protoboard2/objects/object-service', init => {
  const _ = init(() => {
    const rootEl = document.createElement('div');
    const shadowRoot = rootEl.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectService = new ObjectService(personaContext.vine);
    $objectService.set(personaContext.vine, () => objectService);

    return {objectService, personaContext, stateService};
  });

  test('getObject', () => {
    should(`create a new Node and emit it`, () => {
      const objectId = 'objectId';
      const node = setId(document.createElement('div'), objectId);
      const payload = 'payload';

      const builder = fakeObjectSpecListBuilder();
      builder.add({id: objectId, payload}, () => observableOf(node));
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.getObject(objectId, _.personaContext)).to.emitWith(node);
    });

    should(`reuse a previous Node if one already exist`, () => {
      const objectId = 'objectId';
      const node = setId(document.createElement('div'), objectId);
      const payload = 'payload';
      const createSpecSpy = createSpy<Observable<NodeWithId<Element>>, []>('createSpec');
      fake(createSpecSpy).always().return(observableOf(node));

      const builder = fakeObjectSpecListBuilder();
      builder.add({id: objectId, payload}, createSpecSpy);
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.getObject(objectId, _.personaContext)).to.emitWith(node);

      // Reset, then call again.
      resetCalls(createSpecSpy);
      assert(_.objectService.getObject(objectId, _.personaContext)).to.emitWith(node);
      assert(createSpecSpy).toNot.haveBeenCalled();
    });

    should(`emit null if object corresponding to the key does not exist`, () => {
      const objectId = 'objectId';

      const builder = fakeObjectSpecListBuilder();
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.getObject(objectId, _.personaContext)).to.emitWith(null);
    });
  });

  test('getObjectSpec', () => {
    should(`emit the object spec`, () => {
      const objectId = 'objectId';
      const payload = 'payload';

      const builder = fakeObjectSpecListBuilder();
      const objectSpy = builder.add({id: objectId, payload});
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.getObjectSpec<string>(objectId)).to.emitWith(objectSpy);
    });

    should(`emit null if the spec corresponding to the key does not exist`, () => {
      const builder = fakeObjectSpecListBuilder();
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.getObjectSpec<string>('objectId')).to.emitWith(null);
    });
  });

  test('objectId$', () => {
    should(`emit the object IDs`, () => {
      const objectId1 = 'objectId1';
      const objectId2 = 'objectId2';
      const objectId3 = 'objectId3';
      const payload = 'payload';

      const builder = fakeObjectSpecListBuilder();
      builder.add({id: objectId1, payload});
      builder.add({id: objectId2, payload});
      builder.add({id: objectId3, payload});
      builder.build(_.stateService, _.personaContext.vine);

      assert(_.objectService.objectIds$).to.emitWith(
          setThat<string>().haveExactElements(new Set([objectId1, objectId2, objectId3])),
      );
    });
  });
});

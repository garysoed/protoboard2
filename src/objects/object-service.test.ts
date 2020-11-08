import {assert, createSpy, fake, resetCalls, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {NodeWithId, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {$getObjectNode} from './object-service';
import {FakeRootStateBuilder} from './testing/fake-object-spec-list-builder';


test('@protoboard2/objects/object-service', init => {
  const _ = init(() => {
    const rootEl = document.createElement('div');
    const shadowRoot = rootEl.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    return {personaContext, stateService};
  });

  test('$getObjectNode', () => {
    should('create a new Node and emit it', () => {
      const objectId = 'objectId';
      const node = setId(document.createElement('div'), objectId);
      const payload = 'payload';

      const builder = new FakeRootStateBuilder({});
      builder.add({id: objectId, payload}, () => observableOf(node));
      builder.build(_.stateService, _.personaContext.vine);

      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(node);
    });

    should('reuse a previous Node if one already exist', () => {
      const objectId = 'objectId';
      const node = setId(document.createElement('div'), objectId);
      const payload = 'payload';
      const createSpecSpy = createSpy<Observable<NodeWithId<Element>>, []>('createSpec');
      fake(createSpecSpy).always().return(observableOf(node));

      const builder = new FakeRootStateBuilder({});
      builder.add({id: objectId, payload}, createSpecSpy);
      builder.build(_.stateService, _.personaContext.vine);


      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(node);

      // Reset, then call again.
      resetCalls(createSpecSpy);
      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(node);
      assert(createSpecSpy).toNot.haveBeenCalled();
    });

    should('emit null if object corresponding to the key does not exist', () => {
      const objectId = 'objectId';

      const builder = new FakeRootStateBuilder({});
      builder.build(_.stateService, _.personaContext.vine);


      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(null);
    });
  });
});

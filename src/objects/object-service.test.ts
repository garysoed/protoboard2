import {assert, createSpy, fake, resetCalls, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {NodeWithId, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ActiveSpec} from '../types/active-spec';

import {$createSpecMap, $getObjectNode} from './object-service';
import {$$rootState, RootState} from './root-state';
import {fakeActiveSpec, fakePieceSpec} from './testing/fake-object-spec';


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
      const testType = 'testType';
      const objectId = _.stateService.add(fakePieceSpec({payload: {}, type: testType}));
      const node = setId(document.createElement('div'), objectId);
      $createSpecMap.set(_.personaContext.vine, map => new Map([
        ...map,
        [testType, () => observableOf(node)],
      ]));
      const $root = _.stateService.add<RootState>({
        objectSpecIds: [
          objectId,
          _.stateService.add<ActiveSpec>(fakeActiveSpec({
            payload: {
              containerType: 'indexed',
              $contentSpecs: _.stateService.add([]),
            },
          })),
        ],
      });
      $$rootState.set(_.personaContext.vine, () => $root);

      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(node);
    });

    should('reuse a previous Node if one already exist', () => {
      const testType = 'testType';
      const objectId = _.stateService.add(fakePieceSpec({payload: {}, type: testType}));
      const node = setId(document.createElement('div'), objectId);
      const createSpecSpy = createSpy<Observable<NodeWithId<Element>>, []>('createSpec');
      fake(createSpecSpy).always().return(observableOf(node));
      $createSpecMap.set(_.personaContext.vine, map => new Map([
        ...map,
        [testType, createSpecSpy],
      ]));
      const $root = _.stateService.add<RootState>({
        objectSpecIds: [
          objectId,
          _.stateService.add<ActiveSpec>(fakeActiveSpec({
            payload: {
              containerType: 'indexed',
              $contentSpecs: _.stateService.add([]),
            },
          })),
        ],
      });
      $$rootState.set(_.personaContext.vine, () => $root);

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
      const testType = 'testType';
      const objectId = _.stateService.add(fakePieceSpec({payload: {}, type: testType}));
      const $root = _.stateService.add<RootState>({
        objectSpecIds: [
          objectId,
          _.stateService.add<ActiveSpec>(fakeActiveSpec({
            payload: {
              containerType: 'indexed',
              $contentSpecs: _.stateService.add([]),
            },
          })),
        ],
      });
      $$rootState.set(_.personaContext.vine, () => $root);

      assert($getObjectNode.get(_.personaContext.vine).pipe(
          switchMap(getObjectNode => getObjectNode(objectId, _.personaContext)),
      )).to.emitWith(null);
    });
  });
});

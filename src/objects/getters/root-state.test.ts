import {Vine} from 'grapevine';
import {assert, setThat, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {IsContainer} from '../../payload/is-container';
import {ObjectSpec} from '../../types/object-spec';
import {$$rootState, RootState} from '../root-state';
import {fakeObjectSpec} from '../testing/fake-object-spec';

import {$getContainerOf, $getObjectSpec, $objectSpecIds} from './root-state';


test('@protoboard2/objects/getters/root-state', init => {
  const _ = init(() => {
    const vine = new Vine('test');
    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    return {stateService, vine};
  });

  test('$getContainerOf', () => {
    should('return the correct container state ID', () => {
      const $content = _.stateService.add(fakeObjectSpec({payload: {}}));
      const $container = _.stateService.add<ObjectSpec<IsContainer<'indexed'>>>(
          fakeObjectSpec({payload: {
            containerType: 'indexed',
            $contentSpecs: _.stateService.add([{objectId: $content, coordinate: {index: 0}}]),
          }}),
      );
      const $root = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed', $contentSpecs: _.stateService.add([])},
        })),
        containerIds: [$container],
        objectSpecIds: [$content],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getContainerOf.get(_.vine).pipe(map(getFn => getFn($content))))
          .to.emitWith($container);
    });

    should('return null if the ID has no container', () => {
      const $content = _.stateService.add(fakeObjectSpec({payload: {}}));
      const $root = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed', $contentSpecs: _.stateService.add([])},
        })),
        containerIds: [],
        objectSpecIds: [$content],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getContainerOf.get(_.vine).pipe(map(getFn => getFn($content))))
          .to.emitWith(null);
    });
  });

  test('$getObjectSpec', () => {
    should('emit the object spec', () => {
      const objectSpec = fakeObjectSpec({payload: {}});
      const objectId = _.stateService.add(objectSpec);
      const $root = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed', $contentSpecs: _.stateService.add([])},
        })),
        containerIds: [],
        objectSpecIds: [objectId],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getObjectSpec.get(_.vine).pipe(map(getObjectSpec => getObjectSpec(objectId))))
          .to.emitWith(objectSpec);
    });
  });

  test('$objectSpecIds', () => {
    should('emit the object IDs', () => {
      const objectId1 = _.stateService.add(fakeObjectSpec({payload: {}}));
      const objectId2 = _.stateService.add(fakeObjectSpec({payload: {}}));
      const objectId3 = _.stateService.add(fakeObjectSpec({payload: {}}));
      const $root = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed', $contentSpecs: _.stateService.add([])},
        })),
        containerIds: [],
        objectSpecIds: [objectId1, objectId2, objectId3],
      });
      $$rootState.set(_.vine, () => $root);

      assert($objectSpecIds.get(_.vine)).to.emitWith(
          setThat<StateId<ObjectSpec<any>>>()
              .haveExactElements(new Set([objectId1, objectId2, objectId3])),
      );
    });
  });
});

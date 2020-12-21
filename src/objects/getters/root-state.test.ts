import {Vine} from 'grapevine';
import {assert, setThat, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {map, switchMap} from 'rxjs/operators';

import {activeSpec} from '../../core/active';
import {ContainerSpec} from '../../types/container-spec';
import {ObjectSpec} from '../../types/object-spec';
import {$$rootState, RootState} from '../root-state';
import {fakeContainerSpec, fakePieceSpec} from '../testing/fake-object-spec';

import {$activeId, $activeState, $getContainerOf, $getObjectSpec, $objectSpecIds} from './root-state';


test('@protoboard2/objects/getters/root-state', init => {
  const _ = init(() => {
    const vine = new Vine('test');
    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    return {stateService, vine};
  });

  test('activeId$', () => {
    should('emit the active spec ID if available', () => {
      const $activeSpec = _.stateService.add(activeSpec({
        $contentSpecs: _.stateService.add([]),
      }));
      const $rootState = _.stateService.add({
        $activeState: $activeSpec,
        objectSpecIds: [$activeSpec],
      });
      $$rootState.set(_.vine, () => $rootState);

      assert($activeId.get(_.vine).pipe(map(id => id!.id))).to.emitWith($activeSpec.id);
    });
  });

  test('activeState', () => {
    should('emit the active state if available', () => {
      const activeState = activeSpec({
        $contentSpecs: _.stateService.add([]),
      });
      const $rootState = _.stateService.add({
        $activeState: _.stateService.add(activeState),
        objectSpecIds: [],
      });
      $$rootState.set(_.vine, () => $rootState);

      assert($activeState.get(_.vine)).to.emitWith(activeState);
    });
  });

  test('$getContainerOf', () => {
    should('return the correct container state ID', () => {
      const $content = _.stateService.add(fakePieceSpec({payload: {}}));
      const $container = _.stateService.add<ContainerSpec<unknown, 'indexed'>>(
          fakeContainerSpec({payload: {
            containerType: 'indexed',
            $contentSpecs: _.stateService.add([{objectId: $content, coordinate: {index: 0}}]),
          }}),
      );
      const $root = _.stateService.add<RootState>({
        $activeState: _.stateService.add(activeSpec({
          $contentSpecs: _.stateService.add([]),
        })),
        objectSpecIds: [
          $container,
          $content,
        ],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getContainerOf.get(_.vine).pipe(map(getFn => getFn($content))))
          .to.emitWith($container);
    });

    should('return null if the ID has no container', () => {
      const $content = _.stateService.add(fakePieceSpec({payload: {}}));
      const $root = _.stateService.add<RootState>({
        $activeState: _.stateService.add(activeSpec({
          $contentSpecs: _.stateService.add([]),
        })),
        objectSpecIds: [
          $content,
        ],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getContainerOf.get(_.vine).pipe(map(getFn => getFn($content))))
          .to.emitWith(null);
    });
  });

  test('$getObjectSpec', () => {
    should('emit the object spec', () => {
      const objectSpec = fakePieceSpec({payload: {}});
      const objectId = _.stateService.add(objectSpec);
      const $root = _.stateService.add<RootState>({
        $activeState: _.stateService.add(activeSpec({
          $contentSpecs: _.stateService.add([]),
        })),
        objectSpecIds: [
          objectId,
        ],
      });
      $$rootState.set(_.vine, () => $root);

      assert($getObjectSpec.get(_.vine).pipe(switchMap(getObjectSpec => getObjectSpec(objectId))))
          .to.emitWith(objectSpec);
    });
  });

  test('$objectSpecIds', () => {
    should('emit the object IDs', () => {
      const objectId1 = _.stateService.add(fakePieceSpec({payload: {}}));
      const objectId2 = _.stateService.add(fakePieceSpec({payload: {}}));
      const objectId3 = _.stateService.add(fakePieceSpec({payload: {}}));
      const activeId = _.stateService.add(activeSpec({
        $contentSpecs: _.stateService.add([]),
      }));
      const $root = _.stateService.add<RootState>({
        $activeState: activeId,
        objectSpecIds: [
          objectId1,
          objectId2,
          objectId3,
        ],
      });
      $$rootState.set(_.vine, () => $root);

      assert($objectSpecIds.get(_.vine)).to.emitWith(
          setThat<StateId<ObjectSpec<any>>>()
              .haveExactElements(new Set([objectId1, objectId2, objectId3])),
      );
    });
  });
});

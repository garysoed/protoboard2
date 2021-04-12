import { Vine } from 'grapevine';
import { assert, should, test } from 'gs-testing';
import { fakeStateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { map } from 'rxjs/operators';
import { activeSpec } from '../../core/active';
import { $$rootState } from '../root-state';
import { fakePieceSpec } from '../testing/fake-object-spec';
import { $activeId, $activeState, $getObjectSpec } from './root-state';




test('@protoboard2/objects/getters/root-state', init => {
  const _ = init(() => {
    const stateService = fakeStateService();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    return {stateService, vine};
  });

  test('activeId$', () => {
    should('emit the active spec ID if available', () => {
      const $activeSpec = _.stateService.modify(x => x.add(activeSpec({
        $contentSpecs: x.add([]),
      })));
      const $rootState = _.stateService.modify(x => x.add({
        $activeState: $activeSpec,
        objectSpecIds: [$activeSpec],
      }));
      $$rootState.get(_.vine).next($rootState);

      assert($activeId.get(_.vine).pipe(map(id => id!.id))).to.emitWith($activeSpec.id);
    });
  });

  test('activeState', () => {
    should('emit the active state if available', () => {
      const activeState = activeSpec({
        $contentSpecs: _.stateService.modify(x => x.add([])),
      });
      const $rootState = _.stateService.modify(x => x.add({
        $activeState: x.add(activeState),
        objectSpecIds: [],
      }));
      $$rootState.get(_.vine).next($rootState);

      assert($activeState.get(_.vine)).to.emitWith(activeState);
    });
  });

  test('$getObjectSpec', () => {
    should('emit the object spec', () => {
      const objectSpec = fakePieceSpec({payload: {}});
      const objectId = _.stateService.modify(x => x.add(objectSpec));
      const $root = _.stateService.modify(x => x.add({
        $activeState: x.add(activeSpec({
          $contentSpecs: x.add([]),
        })),
      }));
      $$rootState.get(_.vine).next($root);

      assert($getObjectSpec.get(_.vine)(objectId)).to.emitWith(objectSpec);
    });
  });
});

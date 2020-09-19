import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { $objectSpecListId } from '../objects/object-spec-list';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';
import { ACTIVE_ID } from '../region/active';

import { PickAction } from './pick-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const TARGET_ID = 'targetId';

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const action = new PickAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(TARGET_ID),
        }),
        {location: 1},
    );

    run(action.run());

    return {action, el, personaContext, stateService};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const movedId = 'movedId';
      const otherId1 = 'otherId1';
      const otherId2 = 'otherId2';

      const otherActiveId = 'otherActiveId';

      const builder = fakeObjectSpecListBuilder();
      const $activeContentIds = _.stateService.add([otherActiveId]);
      builder.add({
        id: ACTIVE_ID,
        payload: {$contentIds: $activeContentIds},
      });

      const $targetContentIds = _.stateService.add([otherId1, movedId, otherId2]);
      builder.add({
        id: TARGET_ID,
        payload: {$contentIds: $targetContentIds},
      });
      builder.build(_.stateService, _.personaContext.vine);

      const activeIds$ = createSpySubject(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($activeContentIds))),
      );
      const targetIds$ = createSpySubject(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($targetContentIds))),
      );

      _.action.trigger();

      assert(activeIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([otherActiveId]),
        arrayThat<string>().haveExactElements([otherActiveId, movedId]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([otherId1, movedId, otherId2]),
        arrayThat<string>().haveExactElements([otherId1, otherId2]),
      ]);
    });
  });
});

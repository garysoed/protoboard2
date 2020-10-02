import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { createIndexed, Indexed } from '../coordinate/indexed';
import { ObjectSpec } from '../objects/object-spec';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';
import { ContentSpec, IsContainer } from '../payload/is-container';
import { ACTIVE_ID } from '../region/active';

import { DropAction } from './drop-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/drop-action', init => {
  const TARGET_ID = 'targetId';

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectSpec$ = new ReplaySubject<ObjectSpec<IsContainer<'indexed'>>|null>(1);

    const action = new DropAction(
        createFakeActionContext({
          personaContext,
          objectSpec$,
        }),
        {location: 1},
    );

    run(action.run());

    return {action, el, objectSpec$, personaContext, stateService};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const movedId = {objectId: 'movedId', coordinate: createIndexed(0)};
      const otherId1 = {objectId: 'otherId1', coordinate: createIndexed(0)};
      const otherId2 = {objectId: 'otherId2', coordinate: createIndexed(0)};

      const otherActiveSpec = {objectId: 'otherActiveId', coordinate: createIndexed(0)};

      const builder = fakeObjectSpecListBuilder();
      const $activeContentIds = _.stateService.add([otherId1, movedId, otherId2]);
      builder.add({
        id: ACTIVE_ID,
        payload: {$contentSpecs: $activeContentIds},
      });

      const $targetContentIds = _.stateService.add([otherActiveSpec]);
      const objectSpec = builder.add({
        id: TARGET_ID,
        payload: {type: 'indexed' as const, $contentSpecs: $targetContentIds},
      });
      builder.build(_.stateService, _.personaContext.vine);

      _.objectSpec$.next(objectSpec);

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
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherId1, movedId, otherId2]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherId1, otherId2]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherActiveSpec]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherActiveSpec, movedId]),
      ]);
    });
  });
});

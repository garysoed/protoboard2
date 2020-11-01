import { $stateService } from 'mask';
import { ReplaySubject } from 'rxjs';
import { StateService } from 'gs-tools/export/state';
import { arrayThat, assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID } from '../core/active';
import { ContentSpec, IsContainer } from '../payload/is-container';
import { Indexed, createIndexed } from '../coordinate/indexed';
import { ObjectSpec } from '../objects/object-spec';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

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
        () => 1,
        createFakeActionContext({
          personaContext,
          objectSpec$,
        }),
        {},
    );

    run(action.run());

    return {action, el, objectSpec$, personaContext, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = {objectId: 'otherId1', coordinate: createIndexed(0)};
      const otherSpec2 = {objectId: 'otherId2', coordinate: createIndexed(1)};

      const otherActiveSpec = {objectId: 'otherActiveId', coordinate: createIndexed(0)};
      const movedSpec = {objectId: 'movedId', coordinate: createIndexed(1)};

      const builder = fakeObjectSpecListBuilder();
      const $activeContentIds = _.stateService.add([otherActiveSpec, movedSpec]);
      builder.add({
        id: ACTIVE_ID,
        payload: {type: 'indexed' as const, $contentSpecs: $activeContentIds},
      });

      const $targetContentIds = _.stateService.add([otherSpec1, otherSpec2]);
      const objectSpec = builder.add({
        id: TARGET_ID,
        payload: {containerType: 'indexed' as const, $contentSpecs: $targetContentIds},
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

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([
          otherSpec1,
          otherSpec2,
          objectThat<ContentSpec<Indexed>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(1)),
          }),
        ]),
      ]);
    });
  });
});

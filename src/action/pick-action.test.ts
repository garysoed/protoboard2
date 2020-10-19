import { arrayThat, assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { createIndexed, Indexed } from '../coordinate/indexed';
import { ACTIVE_ID } from '../core/active';
import { ObjectSpec } from '../objects/object-spec';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';
import { ContentSpec, IsContainer } from '../payload/is-container';

import { PickAction } from './pick-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectSpec$ = new ReplaySubject<ObjectSpec<IsContainer<'indexed'>>|null>(1);

    const action = new PickAction(
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
    should(`trigger correctly`, () => {
      const otherSpec1 = {objectId: 'otherId1', coordinate: createIndexed(0)};
      const movedSpec = {objectId: 'movedId', coordinate: createIndexed(1)};
      const otherSpec2 = {objectId: 'otherId2', coordinate: createIndexed(2)};

      const otherActiveSpec = {objectId: 'otherActiveId', coordinate: createIndexed(0)};

      const builder = fakeObjectSpecListBuilder();
      const $activeContentIds = _.stateService.add([otherActiveSpec]);
      builder.add({
        id: ACTIVE_ID,
        payload: {$contentSpecs: $activeContentIds},
      });

      const $targetContentSpecs = _.stateService.add([otherSpec1, movedSpec, otherSpec2]);
      const objectSpec = builder.add({
        id: 'TARGET_ID',
        payload: {containerType: 'indexed' as const, $contentSpecs: $targetContentSpecs},
      });
      builder.build(_.stateService, _.personaContext.vine);
      _.objectSpec$.next(objectSpec);

      const activeIds$ = createSpySubject(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($activeContentIds))),
      );
      const targetIds$ = createSpySubject(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($targetContentSpecs))),
      );

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherActiveSpec]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([
          otherActiveSpec,
          objectThat<ContentSpec<Indexed>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(1)),
          }),
        ]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherSpec1, movedSpec, otherSpec2]),
        arrayThat<ContentSpec<Indexed>>().haveExactElements([otherSpec1, otherSpec2]),
      ]);
    });
  });
});

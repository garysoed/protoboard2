import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {$$rootState, RootState} from '../objects/root-state';
import {fakeObjectSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {ObjectClass, ObjectSpec} from '../types/object-spec';

import {DropAction} from './drop-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectId$ = new ReplaySubject<StateId<ObjectSpec<IsContainer<'indexed'>>>|null>(1);

    const action = new DropAction(
        () => 1,
        createFakeActionContext({
          personaContext,
          objectId$,
        }),
        {},
    );

    run(action.run());

    return {action, el, objectId$, personaContext, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(0),
      };
      const otherSpec2 = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(1),
      };

      const otherActiveSpec = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(0),
      };
      const movedSpec = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(1),
      };

      const $activeContentIds = _.stateService.add([otherActiveSpec, movedSpec]);
      const $rootState = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed', $contentSpecs: $activeContentIds},
        })),
        containerIds: [],
        objectSpecIds: [],
      });
      $$rootState.set(_.personaContext.vine, () => $rootState);

      const $targetContentIds = _.stateService.add([otherSpec1, otherSpec2]);
      const $objectSpec = _.stateService.add(
          fakeObjectSpec({
            payload: {containerType: 'indexed' as const, $contentSpecs: $targetContentIds},
          }),
      );

      _.objectId$.next($objectSpec);

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

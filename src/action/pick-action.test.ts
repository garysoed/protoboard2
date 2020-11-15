import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {ObjectSpec} from '../objects/object-spec';
import {$$rootState, RootState} from '../objects/root-state';
import {fakeObjectSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';

import {PickAction} from './pick-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectId$ = new ReplaySubject<StateId<ObjectSpec<{}>>|null>(1);

    const action = new PickAction(
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
      const movedId = _.stateService.add(fakeObjectSpec({payload: {}}));
      console.log(`movedId: ${movedId}`);
      const otherSpec1 = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(0),
      };
      const movedSpec = {
        objectId: movedId,
        coordinate: createIndexed(1),
      };
      const otherSpec2 = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(2),
      };

      const otherActiveSpec = {
        objectId: _.stateService.add(fakeObjectSpec({payload: {}})),
        coordinate: createIndexed(0),
      };

      const $activeContentIds = _.stateService.add([otherActiveSpec]);
      const $targetContentSpecs = _.stateService.add([otherSpec1, movedSpec, otherSpec2]);
      const $container = _.stateService.add(fakeObjectSpec({
        payload: {
          containerType: 'indexed' as const,
          $contentSpecs: $targetContentSpecs,
        },
      }));
      const $rootState = _.stateService.add<RootState>({
        $activeId: _.stateService.add(fakeObjectSpec({
          payload: {containerType: 'indexed' as const, $contentSpecs: $activeContentIds},
        })),
        containerIds: [$container],
        objectSpecIds: [$container],
      });
      $$rootState.set(_.personaContext.vine, () => $rootState);
      _.objectId$.next(movedId);

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

import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {activeSpec} from '../core/active';
import {$setParent} from '../objects/content-map';
import {$$rootState, RootState} from '../objects/root-state';
import {fakeContainerSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';
import {PieceSpec} from '../types/piece-spec';

import {PickAction} from './pick-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const objectId$ = new ReplaySubject<StateId<PieceSpec<{}>>|null>(1);

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
      const movedId = _.stateService.add(fakePieceSpec({payload: {}}));
      const otherSpec1 = {
        objectId: _.stateService.add(fakePieceSpec({payload: {}})),
        coordinate: createIndexed(0),
      };
      const movedSpec = {
        objectId: movedId,
        coordinate: createIndexed(1),
      };
      const otherSpec2 = {
        objectId: _.stateService.add(fakePieceSpec({payload: {}})),
        coordinate: createIndexed(2),
      };

      const otherActiveSpec = {
        objectId: _.stateService.add(fakePieceSpec({payload: {}})),
        coordinate: createIndexed(0),
      };

      const $activeContentIds = _.stateService.add([otherActiveSpec]);
      const $targetContentSpecs = _.stateService.add([otherSpec1, movedSpec, otherSpec2]);
      const $container = _.stateService.add(fakeContainerSpec({
        payload: {
          containerType: 'indexed' as const,
          $contentSpecs: $targetContentSpecs,
        },
      }));

      const $activeState = _.stateService.add(activeSpec({
        $contentSpecs: $activeContentIds,
      }));
      const $rootState = _.stateService.add<RootState>({$activeState});
      run($setParent.get(_.personaContext.vine).pipe(
          take(1),
          tap(setParent => {
            setParent(otherActiveSpec.objectId, $activeState);
            setParent(otherSpec1.objectId, $container);
            setParent(movedSpec.objectId, $container);
            setParent(otherSpec2.objectId, $container);
          }),
      ));

      $$rootState.set(_.personaContext.vine, () => $rootState);
      _.objectId$.next(movedId);

      const activeIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|null>(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($activeContentIds))),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|null>(
          $stateService.get(_.personaContext.vine)
              .pipe(switchMap(service => service.get($targetContentSpecs))),
      );

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([
          otherActiveSpec,
          objectThat<ContentSpec<'indexed'>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(1)),
          }),
        ]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, movedSpec, otherSpec2]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, otherSpec2]),
      ]);
    });
  });
});

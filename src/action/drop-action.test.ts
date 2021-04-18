import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {activeSpec} from '../core/active';
import {$$rootState} from '../objects/root-state';
import {fakeContainerSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';

import {DropAction} from './drop-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const objectId$ = new ReplaySubject<StateId<ContainerSpec<unknown, 'indexed'>>|null>(1);

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
        objectId: _.stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
        coordinate: createIndexed(0),
      };
      const otherSpec2 = {
        objectId: _.stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
        coordinate: createIndexed(1),
      };

      const otherActiveSpec = {
        objectId: _.stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
        coordinate: createIndexed(0),
      };
      const movedSpec = {
        objectId: _.stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
        coordinate: createIndexed(1),
      };

      const $activeContentIds = _.stateService.modify(x => x.add([otherActiveSpec, movedSpec]));
      const $rootState = _.stateService.modify(x => x.add({
        $activeState: x.add(activeSpec({
          $contentSpecs: $activeContentIds,
        })),
      }));
      $$rootState.get(_.personaContext.vine).next($rootState);

      const $targetContentIds = _.stateService.modify(x => x.add([otherSpec1, otherSpec2]));
      const $objectSpec = _.stateService.modify(x => x.add(
          fakeContainerSpec({
            payload: {containerType: 'indexed' as const, $contentSpecs: $targetContentIds},
          }),
      ));

      _.objectId$.next($objectSpec);

      const activeIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($activeContentIds));
      const targetIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($targetContentIds));

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([
          otherSpec1,
          otherSpec2,
          objectThat<ContentSpec<'indexed'>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(1)),
          }),
        ]),
      ]);
    });
  });
});

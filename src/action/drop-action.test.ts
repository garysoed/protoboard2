import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {of, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {activeSpec} from '../core/active';
import {$$activeSpec} from '../objects/active-spec';
import {fakeContainerSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';

import {Config, DropAction, PositioningType} from './drop-action';
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
    const context = createFakeActionContext<ContainerSpec<unknown, 'indexed'>, Config>({
      objectId$,
      vine: personaContext.vine,
      config$: of({positioning: PositioningType.DEFAULT}),
    });

    const action = new DropAction();

    run(action.run());

    return {action, context, el, objectId$, personaContext, stateService};
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

      const $activeContentId$ = _.stateService
          .resolve($$activeSpec.get(_.personaContext.vine).getValue())
          ._('payload')
          ._('$contentSpecs');
      run($activeContentId$.pipe(
          tap(id => {
            if (!id) {
              return;
            }
            _.stateService.modify(x => x.set(id, [otherActiveSpec, movedSpec]));
          }),
      ));

      const $activeContentIds = _.stateService.modify(x => x.add(
          activeSpec({
            $contentSpecs: x.add([otherActiveSpec, movedSpec]),
          })),
      );
      $$activeSpec.get(_.personaContext.vine).next($activeContentIds);

      const $targetContentIds = _.stateService.modify(x => x.add([otherSpec1, otherSpec2]));
      const $objectSpec = _.stateService.modify(x => x.add(
          fakeContainerSpec({
            payload: {containerType: 'indexed' as const, $contentSpecs: $targetContentIds},
          }),
      ));

      _.objectId$.next($objectSpec);

      const activeIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          _.stateService.resolve($$activeSpec.get(_.personaContext.vine).getValue())
              ._('payload')
              .$('$contentSpecs'),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($targetContentIds));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator(_.context)));

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
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(0)),
          }),
        ]),
      ]);
    });
  });
});

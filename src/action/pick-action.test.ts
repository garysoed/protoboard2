import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {EMPTY, ReplaySubject, Subject} from 'rxjs';

import {activeSpec} from '../core/active';
import {$$activeSpec} from '../core/active-spec';
import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {$setParent} from '../objects/content-map';

import {pickAction} from './pick-action';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();

    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });
    const objectId$ = new ReplaySubject<StateId<{}>>(1);
    const action = pickAction({
      config$: EMPTY,
      objectId$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectId$, onTrigger$, vine, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = _.stateService.modify(x => x.add({}));
      const movedSpec = _.stateService.modify(x => x.add({}));
      const otherSpec2 = _.stateService.modify(x => x.add({}));
      const otherActiveSpec = _.stateService.modify(x => x.add({}));

      const $activeContentIds = _.stateService.modify(x => x.add([otherActiveSpec]));
      const $targetContentSpecs = _.stateService.modify(x => x.add([otherSpec1, movedSpec, otherSpec2]));
      const $container = _.stateService.modify(x => x.add({
        containerType: 'indexed' as const,
        contentsId: $targetContentSpecs,
      }));

      _.stateService.modify(x => x.set(
          $$activeSpec.get(_.vine),
          activeSpec({
            contentsId: $activeContentIds,
          })));

      const setParent = $setParent.get(_.vine);
      setParent(otherActiveSpec, $$activeSpec.get(_.vine));
      setParent(otherSpec1, $container);
      setParent(movedSpec, $container);
      setParent(otherSpec2, $container);

      _.objectId$.next(movedSpec);

      const activeIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          $stateService.get(_.vine).resolve($activeContentIds));
      const targetIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          $stateService.get(_.vine).resolve($targetContentSpecs));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(activeIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherActiveSpec]),
        arrayThat<StateId<unknown>>().haveExactElements([
          otherActiveSpec,
          objectThat<StateId<unknown>>().haveProperties({
            ...movedSpec,
          }),
        ]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherSpec1, movedSpec, otherSpec2]),
        arrayThat<StateId<unknown>>().haveExactElements([otherSpec1, otherSpec2]),
      ]);
    });
  });
});

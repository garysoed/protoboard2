import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {$$activeSpec} from '../core/active-spec';
import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {dropAction, PositioningType} from './drop-action';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });
    const action = dropAction({
      config$: of({
        positioning: PositioningType.DEFAULT,
        trigger: {type: TriggerType.CLICK},
      }),
      objectId$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectId$, onTrigger$, stateService, vine};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = _.stateService.modify(x => x.add({}));
      const otherSpec2 = _.stateService.modify(x => x.add({}));

      const otherActiveSpec = _.stateService.modify(x => x.add({}));
      const movedSpec = _.stateService.modify(x => x.add({}));

      const $activeContentId$ = _.stateService
          .resolve($$activeSpec.get(_.vine))
          ._('contentsId');
      run($activeContentId$.pipe(
          tap(id => {
            if (!id) {
              return;
            }
            _.stateService.modify(x => x.set(id, [otherActiveSpec, movedSpec]));
          }),
      ));

      _.stateService.modify(x => x.set($$activeSpec.get(_.vine), {
        containerType: 'indexed',
        contentsId: x.add([otherActiveSpec, movedSpec]),
      }));

      const $targetContentIds = _.stateService.modify(x => x.add([otherSpec1, otherSpec2]));
      const $objectSpec = _.stateService.modify(x => x.add(
          {containerType: 'indexed' as const, contentsId: $targetContentIds},
      ));

      _.objectId$.next($objectSpec);

      const activeIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          _.stateService.resolve($$activeSpec.get(_.vine)).$('contentsId'),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          $stateService.get(_.vine).resolve($targetContentIds));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(activeIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<StateId<unknown>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<StateId<unknown>>().haveExactElements([otherSpec1, otherSpec2, movedSpec]),
      ]);
    });
  });
});

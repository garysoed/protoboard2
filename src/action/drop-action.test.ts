import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';

import {$activeSpecPath} from '../core/active-spec';
import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {dropAction, PositioningType} from './drop-action';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();

    const objectPath$ = new ReplaySubject<ObjectPath<IsContainer>>(1);
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
      objectPath$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectPath$, onTrigger$, stateService, vine};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = _.stateService.immutablePath(_.stateService.addRoot({}));
      const otherSpec2 = _.stateService.immutablePath(_.stateService.addRoot({}));

      const otherActiveSpec = _.stateService.immutablePath(_.stateService.addRoot({}));
      const movedSpec = _.stateService.immutablePath(_.stateService.addRoot({}));

      const activeContentId$ = _.stateService
          ._($activeSpecPath.get(_.vine))
          .$('contentsId');

      run(of([otherActiveSpec, movedSpec]).pipe(activeContentId$.set()));

      const targetId = _.stateService.addRoot({
        containerType: 'indexed' as const,
        contentsId: mutableState([otherSpec1, otherSpec2]),
      });
      const targetPath = _.stateService.immutablePath(targetId);

      _.objectPath$.next(targetPath);

      const activeIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
          _.stateService._($activeSpecPath.get(_.vine)).$('contentsId'),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
          _.stateService._(targetPath).$('contentsId'),
      );

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(activeIds$).to.emitSequence([
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherSpec1, otherSpec2, movedSpec]),
      ]);
    });
  });
});

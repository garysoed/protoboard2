import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
import {EMPTY, of, ReplaySubject, Subject} from 'rxjs';

import {$activeSpecPath} from '../core/active-spec';
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
    const objectPath$ = new ReplaySubject<ObjectPath<{}>>(1);
    const action = pickAction({
      config$: EMPTY,
      objectPath$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectPath$, onTrigger$, vine, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1Path = _.stateService.immutablePath(_.stateService.addRoot({}));
      const movedSpecPath = _.stateService.immutablePath(_.stateService.addRoot({}));
      const otherSpec2Path = _.stateService.immutablePath(_.stateService.addRoot({}));
      const otherActiveSpecPath = _.stateService.immutablePath(_.stateService.addRoot({}));

      const containerIdPath = _.stateService.immutablePath(_.stateService.addRoot({
        containerType: 'indexed' as const,
        contentsId: mutableState([otherSpec1Path, movedSpecPath, otherSpec2Path]),
      }));

      run(
          of([otherActiveSpecPath])
              .pipe(_.stateService._($activeSpecPath.get(_.vine)).$('contentsId').set()),
      );

      const setParent = $setParent.get(_.vine);
      setParent(otherActiveSpecPath, $activeSpecPath.get(_.vine));
      setParent(otherSpec1Path, containerIdPath);
      setParent(movedSpecPath, containerIdPath);
      setParent(otherSpec2Path, containerIdPath);

      _.objectPath$.next(movedSpecPath);

      const activeIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
          $stateService.get(_.vine)._($activeSpecPath.get(_.vine)).$('contentsId'));
      const targetIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
          $stateService.get(_.vine)._(containerIdPath).$('contentsId'));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(activeIds$).to.emitSequence([
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherActiveSpecPath]),
        arrayThat<ObjectPath<unknown>>().haveExactElements([
          otherActiveSpecPath,
          objectThat<ObjectPath<unknown>>().haveProperties({
            ...movedSpecPath,
          }),
        ]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherSpec1Path, movedSpecPath, otherSpec2Path]),
        arrayThat<ObjectPath<unknown>>().haveExactElements([otherSpec1Path, otherSpec2Path]),
      ]);
    });
  });
});

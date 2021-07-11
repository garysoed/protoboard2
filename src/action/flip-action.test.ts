import {$stateService, Vine} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, flipAction} from './flip-action';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const objectId = stateService.addRoot({currentFaceIndex: mutableState(2)});
    const objectPath = stateService.immutablePath(objectId);
    const config$ = new ReplaySubject<Config>(1);

    const action = flipAction({
      config$,
      objectPath$: of(objectPath),
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {config$, action, objectPath, onTrigger$, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by half the face count', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('currentFaceIndex')).to.emitWith(3);
    });

    should('wrap the face index by the count', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      const faceIndex$ = createSpySubject(_.stateService._(_.objectPath).$('currentFaceIndex'));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should('use the config object', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      _.config$.next({count: 6, trigger: {type: TriggerType.CLICK}});
      const faceIndex$ = createSpySubject(_.stateService._(_.objectPath).$('currentFaceIndex'));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

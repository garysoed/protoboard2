import {$stateService, Vine} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Config, turnAction} from './turn-action';


test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const objectId = stateService.addRoot<IsMultifaced>({currentFaceIndex: mutableState(2)});
    const objectPath = stateService.immutablePath(objectId);
    const config$ = new ReplaySubject<Config>(1);
    const action = turnAction({
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

    return {action, config$, objectPath, onTrigger$, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by 1', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      run(of(0).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('currentFaceIndex')).to.emitWith(1);
    });

    should('wrap the face index by the count', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      const faceIndex$ = createSpySubject(_.stateService._(_.objectPath).$('currentFaceIndex'));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should('use the config object', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      const faceIndex$ = createSpySubject(_.stateService._(_.objectPath).$('currentFaceIndex'));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

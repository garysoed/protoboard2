import {$stateService, Vine} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, rotateAction} from './rotate-action';


test('@protoboard2/action/rotate-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const objectId = stateService.addRoot({rotationDeg: mutableState(2)});
    const objectPath = stateService.immutablePath(objectId);
    const config$ = new ReplaySubject<Config>(1);
    const action = rotateAction({
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

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.config$.next({stops: [11, 22, 33], trigger: {type: TriggerType.CLICK}});
      run(of(1).pipe(_.stateService._(_.objectPath).$('rotationDeg').set()));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('rotationDeg')).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.config$.next({stops: [123, 456, 678], trigger: {type: TriggerType.CLICK}});
      run(of(910).pipe(_.stateService._(_.objectPath).$('rotationDeg').set()));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('rotationDeg')).to.emitWith(456);
    });
  });
});

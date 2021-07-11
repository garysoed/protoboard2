import {$stateService, Vine} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, rollAction} from './roll-action';
import {$random} from './util/random';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const seed = new FakeSeed();
    const stateService = fakeStateService();

    const objectId = stateService.addRoot({currentFaceIndex: mutableState(2)});
    const objectPath = stateService.immutablePath(objectId);
    const config$ = new ReplaySubject<Config>(1);
    const action = rollAction({
      config$,
      objectPath$: of(objectPath),
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $random, withValue: fromSeed(seed)},
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {config$, objectPath, onTrigger$, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.config$.next({count: 3, trigger: {type: TriggerType.CLICK}});
      run(of(0).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));
      _.seed.values = [0.9];

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('currentFaceIndex')).to.emitWith(2);
    });

    should('use the config object', () => {
      _.config$.next({count: 3, trigger: {type: TriggerType.CLICK}});
      run(of(0).pipe(_.stateService._(_.objectPath).$('currentFaceIndex').set()));

      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      _.seed.values = [0.9];

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService._(_.objectPath).$('currentFaceIndex')).to.emitWith(3);
    });
  });
});

import {$stateService, Vine} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, turnAction} from './turn-action';


test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add({$currentFaceIndex: $faceIndex}));
    const config$ = new ReplaySubject<Config>(1);
    const action = turnAction({
      config$,
      objectId$: of(objectId),
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {$faceIndex, action, config$, onTrigger$, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by 1', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(1);
    });

    should('wrap the face index by the count', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should('use the config object', () => {
      _.config$.next({count: 2, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.onTrigger$.next(fakeTriggerEvent({}));
      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

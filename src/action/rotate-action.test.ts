import {$stateService, Vine} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, rotateAction} from './rotate-action';


test('@protoboard2/action/rotate-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const $rotationDeg = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add({$rotationDeg}));
    const config$ = new ReplaySubject<Config>(1);
    const action = rotateAction({
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

    return {$rotationDeg, action, config$, onTrigger$, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.config$.next({stops: [11, 22, 33], trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$rotationDeg, 1));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.config$.next({stops: [123, 456, 678], trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$rotationDeg, 910));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

import {$stateService, Vine} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, flipAction} from './flip-action';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const stateService = fakeStateService();

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectSpec = {$currentFaceIndex: $faceIndex};
    const objectId$ = of(stateService.modify(x => x.add(objectSpec)));
    const config$ = new ReplaySubject<Config>(1);

    const action = flipAction({
      config$,
      objectId$,
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {config$, $faceIndex, action, onTrigger$, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by half the face count', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });

    should('wrap the face index by the count', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});
      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should('use the config object', () => {
      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.config$.next({count: 6, trigger: {type: TriggerType.CLICK}});
      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});
      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

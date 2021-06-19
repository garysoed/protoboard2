import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of, ReplaySubject, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {Config, rollAction} from './roll-action';
import {$random} from './util/random';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const seed = new FakeSeed();
    const stateService = fakeStateService();

    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $random, withValue: fromSeed(seed)},
        {override: $stateService, withValue: stateService},
      ],
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add({$currentFaceIndex: $faceIndex}));
    const config$ = new ReplaySubject<Config>(1);
    const action = rollAction(
        config$,
        of(objectId),
        personaContext,
    ).action;

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {$faceIndex, config$, el, onTrigger$, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.config$.next({count: 3, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 0));
      _.seed.values = [0.9];

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(2);
    });

    should('use the config object', () => {
      _.config$.next({count: 3, trigger: {type: TriggerType.CLICK}});
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      _.config$.next({count: 4, trigger: {type: TriggerType.CLICK}});
      _.seed.values = [0.9];

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });
  });
});

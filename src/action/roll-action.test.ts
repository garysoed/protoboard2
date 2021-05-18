import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {BehaviorSubject, of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {Config, rollAction} from './roll-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {$random} from './util/random';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const seed = new FakeSeed();
    const stateService = fakeStateService();

    const {vine} = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $random, withValue: fromSeed(seed)},
        {override: $stateService, withValue: stateService},
      ],
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add(fakePieceSpec({
      payload: {$currentFaceIndex: $faceIndex},
    })));

    const config$ = new BehaviorSubject<Config>({count: 3});
    const context = createFakeActionContext<PieceSpec<IsMultifaced>, Config>({
      config$,
      objectId$: of(objectId),
      vine,
    });
    const action = rollAction({count: 3}, TriggerType.R).action;

    return {$faceIndex, action, config$, context, el, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 0));
      _.seed.values = [0.9];

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator(_.context)));

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(2);
    });

    should('use the config object', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      _.config$.next({count: 4});

      _.seed.values = [0.9];

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator(_.context)));

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });
  });
});

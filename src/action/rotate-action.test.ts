import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {BehaviorSubject, of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';

import {Config, rotateAction} from './rotate-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/rotate-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
      shadowRoot,
    });

    const $rotationDeg = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add(fakePieceSpec({payload: {$rotationDeg}})));

    const config$ = new BehaviorSubject({
      stops: [11, 22, 33],
      trigger: {type: TriggerType.R} as const,
    });
    const context = createFakeActionContext<PieceSpec<IsRotatable>, Config>({
      config$,
      objectId$: of(objectId),
      vine: personaContext.vine,
    });
    const action = rotateAction({stops: [11, 22, 33]}).action;

    return {$rotationDeg, action, config$, context, el, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.stateService.modify(x => x.set(_.$rotationDeg, 1));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action(_.context)));

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.config$.next({stops: [123, 456, 678], trigger: {type: TriggerType.R}});

      _.stateService.modify(x => x.set(_.$rotationDeg, 910));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action(_.context)));

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

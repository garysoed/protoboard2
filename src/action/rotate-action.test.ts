import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of, BehaviorSubject} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';

import {RotateAction, Config} from './rotate-action';
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

    const config$ = new BehaviorSubject<Partial<Config>>({});
    const action = new RotateAction(
        createFakeActionContext({
          personaContext,
          objectId$: of(objectId),
          getConfig$: () => config$,
        }),
        {stops: [11, 22, 33]},
    );
    run(action.run());

    return {$rotationDeg, action, config$, el, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.stateService.modify(x => x.set(_.$rotationDeg, 1));

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.config$.next({stops: [123, 456, 678]});

      _.stateService.modify(x => x.set(_.$rotationDeg, 910));

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

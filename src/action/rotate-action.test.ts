import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';

import {fakeObjectSpec} from '../objects/testing/fake-object-spec';

import {RotateAction} from './rotate-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/rotate-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const $rotationDeg = stateService.add(2);
    const objectId = stateService.add(fakeObjectSpec({payload: {$rotationDeg}}));

    const action = new RotateAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(objectId),
        }),
        {stops: [11, 22, 33]},
    );
    run(action.run());

    return {$rotationDeg, action, el, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.stateService.set(_.$rotationDeg, 1);

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.el.setAttribute('pb-rotate-stops', '[123 456 678]');

      _.stateService.set(_.$rotationDeg, 910);

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

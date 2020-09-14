import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { $objectSpecListId } from '../objects/object-spec-list';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { FlipAction } from './flip-action';
import { IsMultifaced } from './payload/is-multifaced';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/flip-action', init => {
  const TARGET_ID = 'TARGET_ID';

  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = fakeObjectSpecListBuilder();
    const $faceIndex = stateService.add(2);
    builder.add<IsMultifaced>({id: TARGET_ID, payload: {$faceIndex}});

    const $rootId = stateService.add(builder.build());
    $objectSpecListId.set(personaContext.vine, () => $rootId);

    const action = new FlipAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(TARGET_ID),
        }),
        {count: 4},
    );

    run(action.run());

    return {$faceIndex, action, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should(`increase the face by half the face count`, () => {
      _.stateService.set(_.$faceIndex, 1);

      _.action.trigger();

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(3);
    });

    should(`wrap the face index by the count`, () => {
      _.stateService.set(_.$faceIndex, 1);

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should(`use the config object`, () => {
      _.stateService.set(_.$faceIndex, 1);

      _.el.setAttribute('pb-flip-count', '6');

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

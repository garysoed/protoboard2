import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of, BehaviorSubject} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';

import {FlipAction, Config} from './flip-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectSpec = fakePieceSpec({
      payload: {$currentFaceIndex: $faceIndex},
    });

    const config$ = new BehaviorSubject<Partial<Config>>({});
    const action = new FlipAction(
        createFakeActionContext({
          personaContext,
          objectId$: of(stateService.modify(x => x.add(objectSpec))),
          getConfig$: () => config$,
        }),
        {count: 4},
    );

    run(action.run());

    return {$faceIndex, action, config$, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by half the face count', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });

    should('wrap the face index by the count', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.action.trigger({mouseX: 0, mouseY: 0});
      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should('use the config object', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.config$.next({count: 6});

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      _.action.trigger({mouseX: 0, mouseY: 0});
      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

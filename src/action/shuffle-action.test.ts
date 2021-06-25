import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {IsContainer} from '../payload/is-container';

import {shuffleAction, shuffleActionConfigSpecs} from './shuffle-action';
import {compileConfig} from './util/compile-config';
import {$random} from './util/random';


test('@protoboard2/action/shuffle-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const seed = new FakeSeed();
    const context = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $random, withValue: fromSeed(seed)},
        {override: $stateService, withValue: stateService},
      ],
    });

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const action = shuffleAction({
      config$: compileConfig(host(shuffleActionConfigSpecs({}))._, context),
      objectId$,
      context,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, el, objectId$, onTrigger$, context, seed, stateService};
  });

  should('shuffle the child elements correctly', () => {
    const object1 = _.stateService.modify(x => x.add({}));
    const object2 = _.stateService.modify(x => x.add({}));
    const object3 = _.stateService.modify(x => x.add({}));
    const object4 = _.stateService.modify(x => x.add({}));

    const containerId = _.stateService.modify(x => x.add({
      $contentSpecs: x.add([object1, object2, object3, object4]),
    }));
    _.objectId$.next(containerId);

    const contents$ = createSpySubject(_.stateService.resolve(_.objectId$).$('$contentSpecs'));

    _.seed.values = [1, 0, 0.5, 2];

    _.onTrigger$.next({mouseX: 0, mouseY: 0});

    assert(contents$).to.emitWith(
        arrayThat<StateId<unknown>>().haveExactElements([object2, object3, object1, object4]),
    );
  });
});

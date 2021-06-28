import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {shuffleAction} from './shuffle-action';
import {$random} from './util/random';


test('@protoboard2/action/shuffle-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();
    const seed = new FakeSeed();

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const action = shuffleAction({
      config$: of({trigger: {type: TriggerType.L}}),
      objectId$,
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $random, withValue: fromSeed(seed)},
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectId$, onTrigger$, seed, stateService};
  });

  should('shuffle the child elements correctly', () => {
    const object1 = _.stateService.modify(x => x.add({}));
    const object2 = _.stateService.modify(x => x.add({}));
    const object3 = _.stateService.modify(x => x.add({}));
    const object4 = _.stateService.modify(x => x.add({}));

    const containerId = _.stateService.modify(x => x.add({
      contentsId: x.add([object1, object2, object3, object4]),
    }));
    _.objectId$.next(containerId);

    const contents$ = createSpySubject(_.stateService.resolve(_.objectId$).$('contentsId'));

    _.seed.values = [1, 0, 0.5, 2];

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(contents$).to.emitWith(
        arrayThat<StateId<unknown>>().haveExactElements([object2, object3, object1, object4]),
    );
  });
});

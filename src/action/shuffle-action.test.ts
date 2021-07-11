import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
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

    const objectId$ = new ReplaySubject<ObjectPath<IsContainer>>(1);
    const action = shuffleAction({
      config$: of({trigger: {type: TriggerType.L}}),
      objectPath$: objectId$,
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

    return {action, objectPath$: objectId$, onTrigger$, seed, stateService};
  });

  should('shuffle the child elements correctly', () => {
    const object1Path = _.stateService.immutablePath(_.stateService.addRoot({}));
    const object2Path = _.stateService.immutablePath(_.stateService.addRoot({}));
    const object3Path = _.stateService.immutablePath(_.stateService.addRoot({}));
    const object4Path = _.stateService.immutablePath(_.stateService.addRoot({}));

    const containerId = _.stateService.immutablePath(
        _.stateService.addRoot({
          contentsId: mutableState([object1Path, object2Path, object3Path, object4Path]),
        }),
    );
    _.objectPath$.next(containerId);

    const contents$ = createSpySubject(_.stateService._(_.objectPath$).$('contentsId'));

    _.seed.values = [1, 0, 0.5, 2];

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(contents$).to.emitWith(
        arrayThat<ObjectPath<unknown>>().haveExactElements([
          object2Path,
          object3Path,
          object1Path,
          object4Path,
        ]),
    );
  });
});

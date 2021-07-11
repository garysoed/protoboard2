import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {$setParent} from '../objects/content-map';
import {IsContainer} from '../payload/is-container';

import {pickAllAction} from './pick-all-action';

test('@protoboard2/src/action/pick-all-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();

    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const objectPath$ = new ReplaySubject<ObjectPath<IsContainer>>(1);
    const action = pickAllAction({
      config$: of({trigger: {type: TriggerType.CLICK}}),
      objectPath$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectPath$, onTrigger$, vine, stateService};
  });

  should('trigger correctly', () => {
    const object1Path = _.stateService.immutablePath(_.stateService.addRoot({}));
    const object2Path = _.stateService.immutablePath(_.stateService.addRoot({}));
    const object3Path = _.stateService.immutablePath(_.stateService.addRoot({}));

    const containerId = _.stateService.immutablePath(
        _.stateService.addRoot({
          contentsId: mutableState([object1Path, object2Path, object3Path]),
        }),
    );
    _.objectPath$.next(containerId);

    const setParent = $setParent.get(_.vine);
    setParent(object1Path, containerId);
    setParent(object2Path, containerId);
    setParent(object3Path, containerId);

    const contents$ = createSpySubject(
        _.stateService._(_.objectPath$).$('contentsId').pipe(
            map(contents => contents ?? []),
        ),
    );
    const activeContents$ = createSpySubject(
        $activeSpec.get(_.vine).$('contentsId').pipe(map(contents => contents ?? [])),
    );

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(contents$).to.emitSequence([
      arrayThat<ObjectPath<unknown>>().haveExactElements([object1Path, object2Path, object3Path]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([object1Path, object2Path]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([object1Path]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([]),
    ]);

    assert(activeContents$).to.emitSequence([
      arrayThat<ObjectPath<unknown>>().haveExactElements([]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([object3Path]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([object3Path, object2Path]),
      arrayThat<ObjectPath<unknown>>().haveExactElements([object3Path, object2Path, object1Path]),
    ]);
  });
});
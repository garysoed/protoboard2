import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
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

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const action = pickAllAction({
      config$: of({trigger: {type: TriggerType.CLICK}}),
      objectId$,
      vine,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, objectId$, onTrigger$, vine, stateService};
  });

  should('trigger correctly', () => {
    const objectId1 = _.stateService.modify(x => x.add({}));
    const objectId2 = _.stateService.modify(x => x.add({}));
    const objectId3 = _.stateService.modify(x => x.add({}));

    const containerId = _.stateService.modify(x => x.add({
      contentsId: x.add([objectId1, objectId2, objectId3]),
    }));
    _.objectId$.next(containerId);

    const setParent = $setParent.get(_.vine);
    setParent(objectId1, containerId);
    setParent(objectId2, containerId);
    setParent(objectId3, containerId);

    const contents$ = createSpySubject(
        _.stateService.resolve(_.objectId$).$('contentsId').pipe(
            map(contents => contents ?? []),
        ),
    );
    const activeContents$ = createSpySubject(
        $activeSpec.get(_.vine).$('contentsId').pipe(map(contents => contents ?? [])),
    );

    _.onTrigger$.next({mouseX: 0, mouseY: 0});

    assert(contents$).to.emitSequence([
      arrayThat<StateId<unknown>>().haveExactElements([objectId1, objectId2, objectId3]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId1, objectId2]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId1]),
      arrayThat<StateId<unknown>>().haveExactElements([]),
    ]);

    assert(activeContents$).to.emitSequence([
      arrayThat<StateId<unknown>>().haveExactElements([]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId3]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId3, objectId2]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId3, objectId2, objectId1]),
    ]);
  });
});
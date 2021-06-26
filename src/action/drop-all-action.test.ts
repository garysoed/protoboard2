import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, ReplaySubject, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {PositioningType} from './drop-action';
import {dropAllAction} from './drop-all-action';


test('@protoboard2/src/action/drop-all-action', init => {
  const _ = init(() => {
    const stateService = fakeStateService();

    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const action = dropAllAction({
      config$: of({
        positioning: PositioningType.DEFAULT,
        trigger: {type: TriggerType.CLICK},
      }),
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
      contentsId: x.add([]),
    }));
    _.objectId$.next(containerId);

    const $activeContentId$ = $activeSpec.get(_.vine)._('contentsId');
    run($activeContentId$.pipe(
        tap(id => {
          if (!id) {
            return;
          }
          _.stateService.modify(x => x.set(id, [objectId1, objectId2, objectId3]));
        }),
    ));

    const contents$ = createSpySubject(
        _.stateService.resolve(_.objectId$).$('contentsId').pipe(
            map(contents => contents ?? []),
        ),
    );
    const activeContents$ = createSpySubject(
        $activeSpec.get(_.vine).$('contentsId').pipe(map(contents => contents ?? [])),
    );

    _.onTrigger$.next({mouseX: 0, mouseY: 0});

    assert(activeContents$).to.emitSequence([
      arrayThat<StateId<unknown>>().haveExactElements([objectId1, objectId2, objectId3]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId1, objectId2]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId1]),
      arrayThat<StateId<unknown>>().haveExactElements([]),
    ]);

    assert(contents$).to.emitSequence([
      arrayThat<StateId<unknown>>().haveExactElements([]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId3]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId2, objectId3]),
      arrayThat<StateId<unknown>>().haveExactElements([objectId1, objectId2, objectId3]),
    ]);
  });
});
import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {EMPTY, of, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {helpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';


test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};

  const _ = init(() => {
    const vine = new Vine({
      appName: 'test',
    });
    const action = helpAction({
      config$: of({
        actionTriggers: [
          {trigger: TRIGGER, actionName: 'test'},
        ],
        trigger: {type: TriggerType.CLICK},
      }),
      vine,
      objectId$: EMPTY,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, onTrigger$, vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(actions$).to.emitSequence([
        arrayThat<ActionTrigger>().haveExactElements([]),
        arrayThat<ActionTrigger>().haveExactElements([
          objectThat<ActionTrigger>().haveProperties({
            actionName: 'test',
            trigger: TRIGGER,
          }),
        ]),
      ]);
    });
  });
});

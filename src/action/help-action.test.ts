import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';

import {TriggerConfig} from './action-spec';
import {helpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};

  const _ = init(() => {
    const el = document.createElement('div');
    const vine = new Vine({appName: 'test'});
    const context = createFakeActionContext<{}, TriggerConfig>({vine});

    const action = helpAction(of([
      {trigger: TRIGGER, actionName: 'test'},
    ])).action;

    return {action, context, el, vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action(_.context)));

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

import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';

import {helpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';
import {triggerKey} from './testing/trigger-key';


test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const action = helpAction(
        of([
          {trigger: TRIGGER, actionName: 'test'},
        ]),
        personaContext,
    ).action;

    return {action, el, vine: personaContext.vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      run(_.action());
      triggerKey(_.el, {key: TriggerType.QUESTION, shiftKey: true});

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

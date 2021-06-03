import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';

import {TriggerConfig} from './action-spec';
import {helpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';


test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const context = createFakeActionContext<{}, TriggerConfig>({
      vine: personaContext.vine,
      personaContext,
    });

    const action = helpAction(of([
      {trigger: TRIGGER, actionName: 'test'},
    ])).action;

    return {action, context, el, vine: personaContext.vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      run(_.action(_.context));
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

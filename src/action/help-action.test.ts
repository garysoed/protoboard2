import { arrayThat, assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { _v } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { TriggerSpec } from '../core/trigger-spec';

import { HelpAction } from './help-action';
import { $helpService, ActionTrigger } from './help-service';
import { createFakeActionContext } from './testing/fake-action-context';


class TestAction extends BaseAction<object> {
  constructor(context: ActionContext<object>) {
    super('test', 'test', {}, context, {});
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(): Observable<unknown> {
    return EMPTY;
  }
}

test('@protoboard2/action/help-action', init => {
  const TRIGGER = TriggerSpec.T;

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const vine = _v.build('test');
    const context = createFakeActionContext({
      personaContext: createFakeContext({shadowRoot, vine}),
    });
    const testAction = new TestAction(context);

    const action = new HelpAction(context, new Map([[TRIGGER, testAction]]));
    run(action.run());

    return {action, el, testAction, vine};
  });

  test('onTrigger', () => {
    should(`show the help correctly`, () => {
      const actions$ = createSpySubject($helpService.get(_.vine)
          .pipe(switchMap(service => service.actions$)),
      );

      _.action.trigger();

      assert(actions$).to.emitSequence([
        arrayThat<ActionTrigger>().haveExactElements([]),
        arrayThat<ActionTrigger>().haveExactElements([
          objectThat<ActionTrigger>().haveProperties({
            action: _.testAction,
            trigger: TRIGGER,
          }),
        ]),
      ]);
    });
  });
});
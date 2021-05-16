import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {createFakeContext} from 'persona/export/testing';
import {EMPTY, Observable, of, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {TriggerType} from '../core/trigger-spec';
import {PieceSpec} from '../types/piece-spec';

import {HelpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';
import {createFakeActionContext} from './testing/fake-action-context';


class TestAction extends BaseAction<PieceSpec<{}>, {}> {
  constructor(context: ActionContext<PieceSpec<{}>>) {
    super('test', 'test', {}, context);
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(EMPTY);
  }
}

test('@protoboard2/action/help-action', init => {
  const TRIGGER = TriggerType.T;

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const vine = new Vine({appName: 'test'});
    const context = createFakeActionContext<PieceSpec<{}>>({
      personaContext: createFakeContext({shadowRoot, vine}),
      objectId$: of(null),
    });
    const testAction = new TestAction(context);

    const action = new HelpAction(context, new Map([[TRIGGER, testAction]]));
    run(action.run());

    return {action, el, testAction, vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator()));

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

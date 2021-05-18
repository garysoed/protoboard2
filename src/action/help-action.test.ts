import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {EMPTY, Observable, of, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {BaseAction, TriggerEvent} from '../core/base-action';
import {TriggerType} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';
import {PieceSpec} from '../types/piece-spec';

import {HelpAction} from './help-action';
import {$helpService, ActionTrigger} from './help-service';
import {createFakeActionContext} from './testing/fake-action-context';


class TestAction extends BaseAction<PieceSpec<{}>, {}> {
  constructor() {
    super('test', 'test', {});
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(EMPTY);
  }
}

test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};

  const _ = init(() => {
    const el = document.createElement('div');
    const vine = new Vine({appName: 'test'});
    const testAction = new TestAction();
    const context = createFakeActionContext<ObjectSpec<any>, {}>({vine});

    const action = new HelpAction([
      {defaultConfig: {}, trigger: TRIGGER, action: testAction},
    ]);

    return {action, context, el, testAction, vine};
  });

  test('onTrigger', () => {
    should('show the help correctly', () => {
      const actions$ = createSpySubject($helpService.get(_.vine).actions$);

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator(_.context)));

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

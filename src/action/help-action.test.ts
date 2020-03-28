import { assert, objectThat, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { PersonaContext } from 'persona';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';
import { trigger } from '../testing/component-tester';

import { HelpAction } from './help-action';
import { $helpService } from './help-service';


class TestAction extends BaseAction {
  constructor(context: PersonaContext) {
    super('test', 'test', {}, {type: TriggerType.CLICK}, context);
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(): Observable<unknown> {
    return EMPTY;
  }
}

test('@protoboard2/action/help-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const vine = _v.build('test');
    const testAction = new TestAction({shadowRoot, vine});

    const action = new HelpAction([testAction], {shadowRoot, vine});

    return {action, el, testAction, vine};
  });

  test('onTrigger', () => {
    should(`show the help correctly`, () => {
      const actions$ = new ReplaySubject<ArrayDiff<BaseAction>>(1);
      $helpService.get(_.vine)
          .pipe(switchMap(service => service.actions$))
          .subscribe(actions$);

      trigger(_.el, _.action);

      assert(actions$).to.emitSequence([
        objectThat<ArrayDiff<BaseAction>>().haveProperties({
          type: 'insert',
          value: _.testAction,
          index: 0,
        }),
      ]);
    });
  });
});

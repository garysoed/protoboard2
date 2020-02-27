import { assert, init, objectThat, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';
import { trigger } from '../testing/component-tester';

import { HelpAction } from './help-action';
import { $helpService } from './help-service';


class TestAction extends BaseAction {
  constructor() {
    super('test', 'test', {}, {type: TriggerType.CLICK});
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected onTrigger(): Observable<unknown> {
    return EMPTY;
  }
}

test('@protoboard2/action/help-action', () => {
  const TEST_ACTION = new TestAction();
  const _ = init(() => {
    const action = new HelpAction([TEST_ACTION]);
    const vine = _v.build('test');

    return {action, vine};
  });

  test('onTrigger', () => {
    should(`show the help correctly`, () => {
      const el = document.createElement('div');
      _.action.install(el.attachShadow({mode: 'open'}), _.vine).subscribe();

      const actions$ = new ReplaySubject<ArrayDiff<BaseAction>>(1);
      $helpService.get(_.vine)
          .pipe(switchMap(service => service.actions$))
          .subscribe(actions$);

      trigger(el, _.action);

      assert(actions$).to.emitSequence([
        objectThat<ArrayDiff<BaseAction>>().haveProperties({
          type: 'insert',
          value: TEST_ACTION,
          index: 0,
        }),
      ]);
    });
  });
});

import { Vine } from 'grapevine';
import { assert, objectThat, setup, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

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
  let action: HelpAction;
  let vine: Vine;

  setup(() => {
    action = new HelpAction([TEST_ACTION]);
    vine = _v.build('test');
  });

  test('onTrigger', () => {
    should(`show the help correctly`, () => {
      const el = document.createElement('div');
      action.install(el.attachShadow({mode: 'open'}), vine).subscribe();

      const actions$ = new ReplaySubject<ArrayDiff<BaseAction>>(1);
      $helpService.get(vine)
          .pipe(switchMap(service => service.actions$))
          .subscribe(actions$);

      action.triggerSpec$.pipe(trigger(el), take(1)).subscribe();

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

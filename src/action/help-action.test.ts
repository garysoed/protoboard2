import { Vine } from '@grapevine';
import { assert, match, setup, should, test } from '@gs-testing';
import { _v } from '@mask';
import { EMPTY, Observable, ReplaySubject } from '@rxjs';
import { switchMap } from '@rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';

import { HelpAction } from './help-action';
import { $helpService, HelpSpec } from './help-service';

class TestAction extends BaseAction {
  constructor() {
    super({type: TriggerType.CLICK});
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
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      const helpSpec$ = new ReplaySubject<HelpSpec|null>(2);
      $helpService.get(vine)
          .pipe(switchMap(service => service.helpSpec$))
          .subscribe(helpSpec$);

      el.dispatchEvent(new CustomEvent('mouseover'));
      window.dispatchEvent(new KeyboardEvent('keydown', {key: '?'}));

      assert(helpSpec$).to.emitSequence([
        null,
        match.anyObjectThat<HelpSpec>().haveProperties({
          actions: match.anyArrayThat().haveExactElements([TEST_ACTION]),
          target: el,
        }),
      ]);
    });
  });
});

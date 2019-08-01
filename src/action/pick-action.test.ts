import { Vine } from '@grapevine';
import { assert, match, setup, should, test } from '@gs-testing';
import { scanArray } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { ReplaySubject } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { PickAction } from './pick-action';
import { $pickService } from './pick-service';

test('@protoboard2/action/pick-action', () => {
  let action: PickAction;
  let vine: Vine;

  setup(() => {
    action = new PickAction();
    vine = _v.build('test');
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const el = document.createElement('div');
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      const elements$ = new ReplaySubject<Element[]>(2);
      $pickService.get(vine)
          .pipe(
              switchMap(service => service.getComponents()),
              scanArray(),
              map(set => [...set]),
          )
          .subscribe(elements$);

      el.click();

      assert(elements$).to.emitSequence([
        match.anyArrayThat<Element>().beEmpty(),
        match.anyArrayThat<Element>().haveExactElements([el]),
      ]);
    });
  });
});

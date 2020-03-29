import { arrayThat, assert, should, test } from 'gs-testing';
import { scanArray } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PickAction } from './pick-action';
import { $pickService } from './pick-service';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const vine = _v.build('test');
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const action = new PickAction(vine);
    action.setActionTarget(shadowRoot);

    return {action, el, vine};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const elements$ = new ReplaySubject<Element[]>(2);
      $pickService.get(_.vine)
          .pipe(
              switchMap(service => service.getComponents()),
              scanArray(),
              map(set => [...set]),
          )
          .subscribe(elements$);

      _.action.trigger();

      assert(elements$).to.emitSequence([
        arrayThat<Element>().beEmpty(),
        arrayThat<Element>().haveExactElements([_.el]),
      ]);
    });
  });
});

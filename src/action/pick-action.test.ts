import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { _v } from 'mask';
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
    run(action.run());

    return {action, el, vine};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const elements$ = createSpySubject(
          $pickService.get(_.vine)
              .pipe(
                  switchMap(service => service.getComponents()),
                  map(set => [...set]),
              ),
      );

      _.action.trigger();

      assert(elements$).to.emitSequence([
        arrayThat<Element>().beEmpty(),
        arrayThat<Element>().haveExactElements([_.el]),
      ]);
    });
  });
});

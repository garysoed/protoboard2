import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { _v } from 'mask';
import { ReplaySubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { DropAction } from './drop-action';
import { $pickService } from './pick-service';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const parentNode$ = new ReplaySubject<Node>(1);
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const vine = _v.build('test');
    const action = new DropAction(parentNode$, vine);
    action.setActionTarget(shadowRoot);

    run(action.run());

    return {action, el, parentNode$, vine};
  });

  test('onTrigger', () => {
    should(`add the component correctly`, () => {
      const parentEl = document.createElement('div');
      _.parentNode$.next(parentEl);

      const componentEl = document.createElement('div');
      run(
          $pickService.get(_.vine)
              .pipe(
                  take(1),
                  tap(service => {
                    service.add(componentEl);
                  }),
              ),
      );

      const components$ = createSpySubject($pickService.get(_.vine)
          .pipe(switchMap(service => service.getComponents())),
      );

      _.action.trigger();

      assert(components$).to.emitSequence([
        arrayThat<Element>().haveExactElements([componentEl]),
        arrayThat<Element>().haveExactElements([]),
      ]);
      assert(parentEl.children.item(0)).to.equal(componentEl);
    });
  });

  should(`not throw if there are no components`, () => {
    const parentEl = document.createElement('div');
    _.parentNode$.next(parentEl);

    const components$ = createSpySubject($pickService.get(_.vine)
        .pipe(switchMap(service => service.getComponents())),
    );

    _.action.trigger();

    assert(components$).to.emitSequence([
      arrayThat<Element>().haveExactElements([]),
    ]);
    assert(parentEl.children.item(0)).to.equal(null);
  });

  should(`not add the component if component is changed without triggering`, () => {
    const parentEl = document.createElement('div');
    _.parentNode$.next(parentEl);

    const componentEl = document.createElement('div');
    run($pickService.get(_.vine)
        .pipe(
            take(1),
            tap(service => service.add(componentEl)),
        ),
    );

    _.action.trigger();

    const componentEl2 = document.createElement('div');
    run($pickService.get(_.vine)
        .pipe(
            take(1),
            tap(service => service.add(componentEl2)),
        ),
    );

    assert(parentEl.children.length).to.equal(1);
  });
});

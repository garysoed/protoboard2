import { Vine } from '@grapevine';
import { assert, match, setup, should, test } from '@gs-testing';
import { scanArray } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { ReplaySubject } from '@rxjs';
import { switchMap, take } from '@rxjs/operators';
import { DropAction } from './drop-action';
import { $pickService } from './pick-service';

test('@protoboard2/action/drop-action', () => {
  let action: DropAction;
  let vine: Vine;
  let parentNode$: ReplaySubject<Node>;

  setup(() => {
    parentNode$ = new ReplaySubject(1);
    vine = _v.build('test');
    action = new DropAction(parentNode$);
  });

  test('onTrigger', () => {
    should(`add the component correctly`, () => {
      const el = document.createElement('div');
      action.install()(vine, el.attachShadow({mode: 'open'})).subscribe();

      const parentEl = document.createElement('div');
      parentNode$.next(parentEl);

      const componentEl = document.createElement('div');
      $pickService.get(vine)
          .pipe(take(1))
          .subscribe(service => service.add(componentEl));

      const components$ = new ReplaySubject<Element[]>(2);
      $pickService.get(vine)
          .pipe(
              switchMap(service => service.getComponents()),
              scanArray(),
          )
          .subscribe(components$);

      el.click();

      assert(components$).to.emitSequence([
        match.anyArrayThat<Element>().haveExactElements([componentEl]),
        match.anyArrayThat<Element>().haveExactElements([]),
      ]);
      assert(parentEl.children.item(0)).to.equal(componentEl);
    });
  });
});

import { assert, match, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { ReplaySubject, Subject } from '@rxjs';
import { map, mapTo, switchMap, take, tap } from '@rxjs/operators';
import { $, PickHand } from './pick-hand';
import { $pickService } from './pick-service';

function getChildrenElements(parent: Element): Element[] {
  const children: Element[] = [];
  for (let i = 0; i < parent.childElementCount; i++) {
    const child = parent.children.item(i);
    if (child) {
      children.push(child);
    }
  }

  return children;
}

test('@protoboard2/action/pick-hand', () => {
  const factory = new PersonaTesterFactory(_p);

  let tester: PersonaTester;
  let el: ElementTester;

  setup(() => {
    tester = factory.build([PickHand]);
    el = tester.createElement('pb-pick-hand', document.body);
  });

  test('renderContentElements', () => {
    should(`handle element addition and deletion`, () => {
      const check$ = new Subject();
      const contents$ = new ReplaySubject<Element[]>(7);
      el.getElement($.container)
          .pipe(
              switchMap(container => check$.pipe(mapTo(container))),
              map(container => getChildrenElements(container)),
          )
          .subscribe(contents$);

      // Add and remove items.
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const el3 = document.createElement('div');

      $pickService.get(tester.vine).subscribe(service => {
        check$.next({});
        service.add(el1);
        check$.next({});
        service.add(el2);
        check$.next({});
        service.add(el3);
        check$.next({});
        service.delete(el2);
        check$.next({});
        service.delete(el1);
        check$.next({});
        service.delete(el3);
        check$.next({});
      });

      assert(contents$).to.emitSequence([
        match.anyArrayThat<Element>().haveExactElements([]),
        match.anyArrayThat<Element>().haveExactElements([el1]),
        match.anyArrayThat<Element>().haveExactElements([el1, el2]),
        match.anyArrayThat<Element>().haveExactElements([el1, el2, el3]),
        match.anyArrayThat<Element>().haveExactElements([el1, el3]),
        match.anyArrayThat<Element>().haveExactElements([el3]),
        match.anyArrayThat<Element>().haveExactElements([]),
      ]);
    });
  });
});

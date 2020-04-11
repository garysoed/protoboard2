import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { Subject } from 'rxjs';
import { map, mapTo, switchMap, take, tap } from 'rxjs/operators';

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

test('@protoboard2/action/pick-hand', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([PickHand], document);
    const el = tester.createElement('pb-pick-hand', document.body);
    return {el, tester};
  });

  test('renderContentElements', () => {
    should(`handle element addition and deletion`, () => {
      const check$ = new Subject();
      const contents$ = createSpySubject(
          _.el.getElement($.container)
              .pipe(
                  switchMap(container => check$.pipe(mapTo(container))),
                  map(container => getChildrenElements(container)),
              ),
      );

      // Add and remove items.
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const el3 = document.createElement('div');

      run(
          $pickService.get(_.tester.vine).pipe(
              tap(service => {
                check$.next({});
                service.add(el1);
                check$.next({});
                service.add(el2);
                check$.next({});
                service.add(el3);
                check$.next({});
                service.deleteAt(1);
                check$.next({});
                service.deleteAt(0);
                check$.next({});
                service.deleteAt(0);
                check$.next({});
              }),
          ),
      );

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
        arrayThat<Element>().haveExactElements([el1]),
        arrayThat<Element>().haveExactElements([el1, el2]),
        arrayThat<Element>().haveExactElements([el1, el2, el3]),
        arrayThat<Element>().haveExactElements([el1, el3]),
        arrayThat<Element>().haveExactElements([el3]),
        arrayThat<Element>().haveExactElements([]),
      ]);
    });
  });

  test('renderLeft', () => {
    should(`render left correctly`, () => {
      const left = 123;
      const width = 456;
      const content = document.createElement('div');
      content.style.display = 'block';
      content.style.width = `${width}px`;
      run(
          $pickService.get(_.tester.vine).pipe(
              take(1),
              tap(service => service.add(content)),
          ),
      );

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.container._.left)).to.emitWith(`${left - width / 2}px`);
    });

    should(`render top correctly`, () => {
      const top = 123;
      const height = 456;
      const content = document.createElement('div');
      content.style.display = 'block';
      content.style.height = `${height}px`;
      run(
          $pickService.get(_.tester.vine).pipe(
              take(1),
              tap(service => service.add(content)),
          ),
      );

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.el.getStyle($.container._.top)).to.emitWith(`${top - height / 2}px`);
    });
  });

  test('computeAllRects', () => {
    should(`use the largest width and height`, () => {
      const size = 123;

      const content1 = document.createElement('div');
      content1.style.display = 'block';
      content1.style.width = `1px`;
      content1.style.height = `${size}px`;

      const content2 = document.createElement('div');
      content2.style.display = 'block';
      content2.style.height = `1px`;
      content2.style.width = `${size}px`;
      run(
          $pickService.get(_.tester.vine).pipe(
              take(1),
              tap(service => {
                service.add(content1);
                service.add(content2);
              }),
          ),
      );

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.container._.left)).to.emitWith(`${-size / 2}px`);
      assert(_.el.getStyle($.container._.top)).to.emitWith(`${-size / 2}px`);
    });
  });
});

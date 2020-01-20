import { arrayThat, assert, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { ElementTester, PersonaTesterFactory } from '@persona/testing';
import { Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { $, GridLayout } from './grid-layout';


const testerFactory = new PersonaTesterFactory(_p);
test('@protoboard2/layout/grid-layout', () => {
  let tester: ElementTester;

  setup(() => {
    tester = testerFactory.build([GridLayout]).createElement('pb-grid-layout', document.body);
  });

  test('setupOnHostMutation', () => {
    should(`set the slot correctly on elements that are added`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');

      tester.element.appendChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal('345_123');
    });

    should(`update slot correctly when changed`, () => {
      const addedEl = document.createElement('div');
      tester.element.appendChild(addedEl);

      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');

      assert(addedEl.getAttribute('slot')).to.equal('345_123');
    });

    should(`reset the slot value when element is removed`, () => {
      const addedEl = document.createElement('div');
      const slot = 'slot';
      addedEl.setAttribute('slot', slot);

      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');

      // Append the element, then change its attributes.
      tester.element.appendChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      tester.element.removeChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal(slot);
    });

    should(`not update slot after element is removed`, () => {
      const addedEl = document.createElement('div');
      const slot = 'slot';
      addedEl.setAttribute('slot', slot);

      // Append the element, remove it, then change its attributes.
      tester.element.appendChild(addedEl);
      tester.element.removeChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      assert(addedEl.getAttribute('slot')).to.equal(slot);
    });

    should(`default x and y to 0 if not specified`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '0');
      addedEl.setAttribute('y', '0');

      tester.element.appendChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal('0_0');
    });
  });

  test('setupRenderGrid', () => {
    let tags$: Observable<string[][]>;
    let slotName$: Observable<string[][]>;

    setup(() => {
      const cellEls$ = tester
          .getElement($.rows)
          .pipe(
              map(rowsEl => {
                const rows: Element[][] = [];

                // tslint:disable-next-line: prefer-for-of
                for (let r = 0; r < rowsEl.children.length; r++) {
                  const rowEl = rowsEl.children.item(r)!;
                  const cols: Element[] = [];

                  // tslint:disable-next-line: prefer-for-of
                  for (let c = 0; c < rowEl.children.length; c++) {
                    cols.push(rowEl.children.item(c)!.children.item(0)!);
                  }

                  rows.push(cols);
                }

                return rows;
              }),
          );
      tags$ = cellEls$.pipe(
          map(colEls => colEls.map(cols => cols.map(el => el.tagName.toLowerCase()))),
      );
      slotName$ = cellEls$.pipe(
          map(colEls => colEls.map(cols => cols.map(el => el.getAttribute('name')!))),
      );
    });

    should(`render the grid correctly`, () => {
      tester.setAttribute($.host._.colCount, 2).subscribe();
      tester.setAttribute($.host._.rowCount, 3).subscribe();

      assert(tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot', 'slot']),
        arrayThat<string>().haveExactElements(['slot', 'slot']),
        arrayThat<string>().haveExactElements(['slot', 'slot']),
      ]));

      assert(slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0', '0_1']),
        arrayThat<string>().haveExactElements(['1_0', '1_1']),
        arrayThat<string>().haveExactElements(['2_0', '2_1']),
      ]));
    });

    should(`rerender the grid if row changes`, () => {
      tester.setAttribute($.host._.colCount, 2).subscribe();
      tester.setAttribute($.host._.rowCount, 3).subscribe();

      tester.setAttribute($.host._.rowCount, 1).subscribe();

      assert(tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot', 'slot']),
      ]));

      assert(slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0', '0_1']),
      ]));
    });

    should(`rerender the grid if col changes`, () => {
      tester.setAttribute($.host._.colCount, 2).subscribe();
      tester.setAttribute($.host._.rowCount, 3).subscribe();

      tester.setAttribute($.host._.colCount, 1).subscribe();

      assert(tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot']),
        arrayThat<string>().haveExactElements(['slot']),
        arrayThat<string>().haveExactElements(['slot']),
      ]));

      assert(slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0']),
        arrayThat<string>().haveExactElements(['1_0']),
        arrayThat<string>().haveExactElements(['2_0']),
      ]));
    });

    should(`render the default values`, () => {
      assert(tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot']),
      ]));

      assert(slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0']),
      ]));
    });
  });
});

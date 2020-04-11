import { arrayThat, assert, run, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { $, GridLayout } from './grid-layout';


const testerFactory = new PersonaTesterFactory(_p);
test('@protoboard2/layout/grid-layout', init => {
  const _ = init(() => {
    const tester = testerFactory.build([GridLayout], document)
        .createElement('pb-grid-layout', document.body);
    return {tester};
  });

  test('setupOnHostMutation', () => {
    should(`set the slot correctly on elements that are added`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');

      _.tester.element.appendChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal('345_123');
    });

    should(`update slot correctly when changed`, () => {
      const addedEl = document.createElement('div');
      _.tester.element.appendChild(addedEl);

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
      _.tester.element.appendChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      _.tester.element.removeChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal(slot);
    });

    should(`not update slot after element is removed`, () => {
      const addedEl = document.createElement('div');
      const slot = 'slot';
      addedEl.setAttribute('slot', slot);

      // Append the element, remove it, then change its attributes.
      _.tester.element.appendChild(addedEl);
      _.tester.element.removeChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      assert(addedEl.getAttribute('slot')).to.equal(slot);
    });

    should(`default x and y to 0 if not specified`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '0');
      addedEl.setAttribute('y', '0');

      _.tester.element.appendChild(addedEl);

      assert(addedEl.getAttribute('slot')).to.equal('0_0');
    });
  });

  test('setupRenderGrid', _, init => {
    const _ = init(_ => {
      const cellEls$ = _.tester
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
      const tags$ = cellEls$.pipe(
          map(colEls => colEls.map(cols => cols.map(el => el.tagName.toLowerCase()))),
      );
      const slotName$ = cellEls$.pipe(
          map(colEls => colEls.map(cols => cols.map(el => el.getAttribute('name')!))),
      );

      return {..._, tags$, slotName$};
    });

    should(`render the grid correctly`, () => {
      run(_.tester.setAttribute($.host._.colCount, 2));
      run(_.tester.setAttribute($.host._.rowCount, 3));

      assert(_.tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot', 'slot']),
        arrayThat<string>().haveExactElements(['slot', 'slot']),
        arrayThat<string>().haveExactElements(['slot', 'slot']),
      ]));

      assert(_.slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0', '0_1']),
        arrayThat<string>().haveExactElements(['1_0', '1_1']),
        arrayThat<string>().haveExactElements(['2_0', '2_1']),
      ]));
    });

    should(`rerender the grid if row changes`, () => {
      run(_.tester.setAttribute($.host._.colCount, 2));
      run(_.tester.setAttribute($.host._.rowCount, 3));

      run(_.tester.setAttribute($.host._.rowCount, 1));

      assert(_.tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot', 'slot']),
      ]));

      assert(_.slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0', '0_1']),
      ]));
    });

    should(`rerender the grid if col changes`, () => {
      run(_.tester.setAttribute($.host._.colCount, 2));
      run(_.tester.setAttribute($.host._.rowCount, 3));

      run(_.tester.setAttribute($.host._.colCount, 1));

      assert(_.tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot']),
        arrayThat<string>().haveExactElements(['slot']),
        arrayThat<string>().haveExactElements(['slot']),
      ]));

      assert(_.slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0']),
        arrayThat<string>().haveExactElements(['1_0']),
        arrayThat<string>().haveExactElements(['2_0']),
      ]));
    });

    should(`render the default values`, () => {
      assert(_.tags$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['slot']),
      ]));

      assert(_.slotName$).to.emitWith(arrayThat<string[]>().haveExactElements([
        arrayThat<string>().haveExactElements(['0_0']),
      ]));
    });
  });
});

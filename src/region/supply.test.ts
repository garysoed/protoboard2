import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { $asArray, $filter, $pipe } from 'gs-tools/export/collect';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { registerFakeStateHandler } from '../state/testing/register-fake-state-handler';

import { $, $supply, Supply } from './supply';

test('@protoboard2/region/supply', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Supply], document);
    const el = tester.createElement($supply.tag);

    // Need to add to body so the dimensions work.
    document.body.appendChild(el.element);
    return {el, tester};
  });

  test('contents$', () => {
    should(`render the contents correctly`, () => {
      const contents$ = createSpySubject(_.el.getChildren($.root).pipe(
          // Filter out the count element
          map(children => $pipe(
              children,
              $filter(el => (el as HTMLElement).id !== 'count'),
              $asArray(),
          )),
      ));

      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';

      const el1 = document.createElement('div1');
      const el2 = document.createElement('div2');
      const el3 = document.createElement('div3');

      registerFakeStateHandler(
          new Map([[id1, el1], [id2, el2], [id3, el3]]),
          _.tester.vine,
      );

      run(_.el.setAttribute($.host._.objectIds, []));
      run(_.el.setAttribute($.host._.objectIds, [id1]));
      run(_.el.setAttribute($.host._.objectIds, [id1, id2]));
      run(_.el.setAttribute($.host._.objectIds, [id1, id2, id3]));
      run(_.el.setAttribute($.host._.objectIds, [id1, id3]));
      run(_.el.setAttribute($.host._.objectIds, [id3]));
      run(_.el.setAttribute($.host._.objectIds, []));

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
        arrayThat<Element>().haveExactElements([el1]),
        arrayThat<Element>().haveExactElements([el1, el2]),
        arrayThat<Element>().haveExactElements([el1, el2, el3]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3]),
        arrayThat<Element>().haveExactElements([el3, el1]),
        arrayThat<Element>().haveExactElements([el3]),
        arrayThat<Element>().haveExactElements([]),
      ]);
    });
  });
});

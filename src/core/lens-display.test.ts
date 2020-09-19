import { arrayThat, assert, run, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map, take, tap } from 'rxjs/operators';

import { $, $lensDisplay, LensDisplay } from './lens-display';
import { $lensService } from './lens-service';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@protoboard2/util/lens-display', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build([LensDisplay], document);
    const el = tester.createElement($lensDisplay.tag);

    return {el, tester};
  });

  test('setupRenderContent', _, init => {
    const _ = init(_ => {
      const outerHtmls$ = _.el.getElement($.root).pipe(
          map(rootEl => {
            const outerHtmls: string[] = [];
            for (let i = 0; i < rootEl.children.length; i++) {
              const el = rootEl.children.item(i);
              if (!el) {
                continue;
              }

              outerHtmls.push(el.outerHTML);
            }

            return outerHtmls;
          }),
      );
      return {..._, outerHtmls$};
    });

    should(`render copy of the elements correctly`, () => {
      const el1 = document.createElement('div');
      const spanEl = document.createElement('span');
      el1.appendChild(spanEl);

      const el2 = document.createElement('h1');
      const fragment = document.createDocumentFragment();
      fragment.appendChild(el1);
      fragment.appendChild(el2);

      run($lensService.get(_.tester.vine).pipe(
          take(1),
          tap(lensService => {
            lensService.show('key', fragment);
          }),
      ));

      assert(_.outerHtmls$).to.emitWith(arrayThat<string>().haveExactElements([
        '<div><span></span></div>',
        '<h1></h1>',
      ]));
    });

    should(`remove the content if the lens service emits null`, () => {
      const el = document.createElement('div');

      const fragment = document.createDocumentFragment();
      fragment.appendChild(el);

      run($lensService.get(_.tester.vine).pipe(
          take(1),
          tap(lensService => {
            lensService.show('key', fragment);
            lensService.hide('key');
          }),
      ));

      assert(_.outerHtmls$).to.emitWith(arrayThat<string>().beEmpty());
    });
  });
});

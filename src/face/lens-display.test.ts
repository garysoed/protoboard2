import {arrayThat, assert, should, test} from 'gs-testing';
import {_p} from 'mask';
import {PersonaTesterFactory} from 'persona/export/testing';

import {$, LensDisplay} from './lens-display';
import {$lensService} from './lens-service';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@protoboard2/util/lens-display', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build({rootCtrls: [LensDisplay], rootDoc: document});
    const el = tester.createElement(LensDisplay);

    return {el, tester};
  });

  function getRenderedHtmls(rootEl: Element): readonly string[] {
    const outerHtmls: string[] = [];
    for (let i = 0; i < rootEl.children.length; i++) {
      const el = rootEl.children.item(i);
      if (!el) {
        continue;
      }

      outerHtmls.push(el.outerHTML);
    }
    return outerHtmls;
  }

  test('setupRenderContent', _, init => {
    const _ = init(_ => {
      const rootEl = _.el.getElement($.root);
      return {..._, rootEl};
    });

    should('render copy of the elements correctly', () => {
      const el1 = document.createElement('div');
      const spanEl = document.createElement('span');
      el1.appendChild(spanEl);

      const el2 = document.createElement('h1');
      const fragment = document.createDocumentFragment();
      fragment.appendChild(el1);
      fragment.appendChild(el2);

      $lensService.get(_.tester.vine).show('key', fragment);

      assert(getRenderedHtmls(_.rootEl)).to.equal(arrayThat<string>().haveExactElements([
        '<div><span></span></div>',
        '<h1></h1>',
      ]));
    });

    should('remove the content if the lens service emits null', () => {
      const el = document.createElement('div');

      const fragment = document.createDocumentFragment();
      fragment.appendChild(el);

      const lensService = $lensService.get(_.tester.vine);
      lensService.show('key', fragment);
      lensService.hide('key');

      assert(getRenderedHtmls(_.rootEl)).to.equal(arrayThat<string>().beEmpty());
    });
  });
});

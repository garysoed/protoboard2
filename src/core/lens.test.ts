import { PersonaTesterFactory } from 'persona/export/testing';
import { _p } from 'mask';
import { assert, createSpyInstance, objectThat, should, test } from 'gs-testing';

import { $, $lens, Lens } from './lens';
import { $lensService, LensService } from './lens-service';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@protoboard2/util/lens', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build([Lens], document);
    const el = tester.createElement($lens.tag);

    const mockLensService = createSpyInstance(LensService);
    $lensService.set(tester.vine, () => mockLensService);

    return {el, mockLensService, tester};
  });

  test('setupHandleMouseOut', () => {
    should('hide the elements', () => {
      _.el.dispatchEvent($.host._.onMouseLeave);

      assert(_.mockLensService.hide).to.haveBeenCalledWith(objectThat<Lens>().beAnInstanceOf(Lens));
    });
  });

  test('setupHandleMouseOver', () => {
    should('show the child elements', () => {
      const spanEl = document.createElement('span');
      const divEl = document.createElement('div');
      divEl.appendChild(spanEl);
      divEl.setAttribute('slot', 'details');
      _.el.element.appendChild(divEl);

      _.el.dispatchEvent($.host._.onMouseEnter);

      const matcher = objectThat<DocumentFragment>().beAnInstanceOf(DocumentFragment);

      assert(_.mockLensService.show).to.haveBeenCalledWith(
          objectThat<Lens>().beAnInstanceOf(Lens),
          matcher,
      );
      assert(matcher.getLastMatch().children.item(0)?.outerHTML).to
          .equal('<div slot="details"><span></span></div>');
    });
  });
});

import {assert, createSpyInstance, objectThat, should, test} from 'gs-testing';
import {_p} from 'mask';
import {PersonaTesterFactory} from 'persona/export/testing';

import {Lens} from './lens';
import {$lensService, LensService} from './lens-service';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@protoboard2/util/lens', init => {
  const _ = init(() => {
    const mockLensService = createSpyInstance(LensService);
    const tester = TESTER_FACTORY.build({
      overrides: [
        {override: $lensService, withValue: mockLensService},
      ],
      rootCtrls: [Lens],
      rootDoc: document,
    });
    const {element, harness} = tester.createHarness(Lens);

    return {element, harness, mockLensService, tester};
  });

  test('setupHandleMouseOut', () => {
    should('hide the elements', () => {
      _.harness.host._.onMouseLeave();

      assert(_.mockLensService.hide).to.haveBeenCalledWith(objectThat<Lens>().beAnInstanceOf(Lens));
    });
  });

  test('setupHandleMouseOver', () => {
    should('show the child elements', () => {
      const spanEl = document.createElement('span');
      const divEl = document.createElement('div');
      divEl.appendChild(spanEl);
      divEl.setAttribute('slot', 'details');
      _.element.appendChild(divEl);

      _.harness.host._.onMouseEnter();

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

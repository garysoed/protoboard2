import { assert, should, test } from 'gs-testing';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';

import { FreeLayout } from './free-layout';


const testerFactory = new PersonaTesterFactory(_p);
test('@protoboard2/layout/free-layout', init => {

  const _ = init(() => {
    const tester = testerFactory.build([FreeLayout], document)
        .createElement('pb-free-layout', document.body);
    return {tester};
  });

  test('setupOnHostMutation', () => {
    should(`set the left, top, height, width correctly on elements that are added`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');
      addedEl.setAttribute('height', '567');
      addedEl.setAttribute('width', '789');

      _.tester.element.appendChild(addedEl);

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('345px');
      assert(addedEl.style.height).to.equal('567px');
      assert(addedEl.style.width).to.equal('789px');
    });

    should(`update left, top, height, width correctly when changed`, () => {
      const addedEl = document.createElement('div');
      _.tester.element.appendChild(addedEl);

      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');
      addedEl.setAttribute('height', '567');
      addedEl.setAttribute('width', '789');

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('345px');
      assert(addedEl.style.height).to.equal('567px');
      assert(addedEl.style.width).to.equal('789px');
    });

    should(`reset the left, top, height, width values when element is removed`, () => {
      const addedEl = document.createElement('div');
      addedEl.style.left = '123px';
      addedEl.style.top = '345px';
      addedEl.style.height = '567px';
      addedEl.style.width = '789px';

      addedEl.setAttribute('x', '234');
      addedEl.setAttribute('y', '456');
      addedEl.setAttribute('height', '678');
      addedEl.setAttribute('width', '891');

      // Append the element, then change its attributes.
      _.tester.element.appendChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');
      addedEl.setAttribute('height', '357');
      addedEl.setAttribute('width', '468');

      _.tester.element.removeChild(addedEl);

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('345px');
      assert(addedEl.style.height).to.equal('567px');
      assert(addedEl.style.width).to.equal('789px');
    });

    should(`not update left, top, height, width after element is removed`, () => {
      const addedEl = document.createElement('div');
      addedEl.style.left = '123px';
      addedEl.style.top = '345px';
      addedEl.style.height = '567px';
      addedEl.style.width = '789px';

      // Append the element, remove it, then change its attributes.
      _.tester.element.appendChild(addedEl);
      _.tester.element.removeChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');
      addedEl.setAttribute('height', '357');
      addedEl.setAttribute('width', '468');

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('345px');
      assert(addedEl.style.height).to.equal('567px');
      assert(addedEl.style.width).to.equal('789px');
    });
  });
});

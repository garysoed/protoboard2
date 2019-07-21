import { assert, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { ElementTester, PersonaTesterFactory } from '@persona/testing';

import { FreeLayout } from './free-layout';

const testerFactory = new PersonaTesterFactory(_p);
test('@protoboard2/layout/free-layout', () => {
  let tester: ElementTester;

  setup(() => {
    tester = testerFactory.build([FreeLayout]).createElement('pb-free-layout', document.body);
  });

  test('setupOnHostMutation', () => {
    should(`set the left, top, height, width correctly on elements that are added`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '345');
      addedEl.setAttribute('height', '567');
      addedEl.setAttribute('width', '789');

      tester.element.appendChild(addedEl);

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('345px');
      assert(addedEl.style.height).to.equal('567px');
      assert(addedEl.style.width).to.equal('789px');
    });

    should(`update left, top, height, width correctly when changed`, () => {
      const addedEl = document.createElement('div');
      tester.element.appendChild(addedEl);

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
      tester.element.appendChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');
      addedEl.setAttribute('height', '357');
      addedEl.setAttribute('width', '468');

      tester.element.removeChild(addedEl);

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
      tester.element.appendChild(addedEl);
      tester.element.removeChild(addedEl);
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

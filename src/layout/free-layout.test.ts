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
    should(`set the left and top correctly on elements that are added`, () => {
      const addedEl = document.createElement('div');
      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '456');

      tester.element.appendChild(addedEl);

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('456px');
    });

    should(`update left and top correctly when changed`, () => {
      const addedEl = document.createElement('div');
      tester.element.appendChild(addedEl);

      addedEl.setAttribute('x', '123');
      addedEl.setAttribute('y', '456');

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('456px');
    });

    should(`reset the left and top values when element is removed`, () => {
      const addedEl = document.createElement('div');
      addedEl.style.left = '123px';
      addedEl.style.top = '456px';
      addedEl.setAttribute('x', '234');
      addedEl.setAttribute('y', '345');

      // Append the element, then change its attributes.
      tester.element.appendChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      tester.element.removeChild(addedEl);

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('456px');
    });

    should(`not update left and top after element is removed`, () => {
      const addedEl = document.createElement('div');
      addedEl.style.left = '123px';
      addedEl.style.top = '456px';

      // Append the element, remove it, then change its attributes.
      tester.element.appendChild(addedEl);
      tester.element.removeChild(addedEl);
      addedEl.setAttribute('x', '135');
      addedEl.setAttribute('y', '246');

      assert(addedEl.style.left).to.equal('123px');
      assert(addedEl.style.top).to.equal('456px');
    });
  });
});

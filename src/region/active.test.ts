import { arrayThat, assert, createSpySubject, run, setThat, should, test } from 'gs-testing';
import { $asArray, $filter, $pipe } from 'gs-tools/export/collect';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { createFakeStateService } from '../state/testing/fake-state-service';
import { registerFakeStateHandler } from '../state/testing/register-fake-state-handler';

import { $, $active, Active } from './active';


test('@protoboard2/region/active', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Active], document);
    const el = tester.createElement($active.tag);
    const fakeStateService = createFakeStateService(tester.vine);

    // Need to add to body so the dimensions work.
    document.body.appendChild(el.element);
    return {el, fakeStateService, tester};
  });

  test('content$', () => {
    should(`handle element addition and deletion`, () => {
      const contents$ = createSpySubject(_.el.getChildren($.root).pipe(
          // Filter out the count element
          map(children => $pipe(
              children,
              $filter(el => (el as HTMLElement).id !== 'count'),
              $asArray(),
          )),
      ));

      // Add and remove items.
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
      _.fakeStateService.setStates(new Set([
        {type: 'test', id: id1, payload: {}},
        {type: 'test', id: id2, payload: {}},
        {type: 'test', id: id3, payload: {}},
      ]));

      run(_.el.setAttribute($.host._.contentIds, []));
      run(_.el.setAttribute($.host._.contentIds, [id1]));
      run(_.el.setAttribute($.host._.contentIds, [id1, id2]));
      run(_.el.setAttribute($.host._.contentIds, [id1, id2, id3]));
      run(_.el.setAttribute($.host._.contentIds, [id1, id3]));
      run(_.el.setAttribute($.host._.contentIds, [id3]));
      run(_.el.setAttribute($.host._.contentIds, []));

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
        arrayThat<Element>().haveExactElements([el1]),
        arrayThat<Element>().haveExactElements([el1, el2]),
        arrayThat<Element>().haveExactElements([el1, el2, el3]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3]),
        arrayThat<Element>().haveExactElements([el3, el1]),
        arrayThat<Element>().haveExactElements([el3, el1]),
        arrayThat<Element>().haveExactElements([el3]),
        arrayThat<Element>().haveExactElements([]),
      ]);
    });
  });

  test('itemCount$', _, init => {
    const _ = init(_ => {
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
      _.fakeStateService.setStates(new Set([
        {type: 'test', id: id1, payload: {}},
        {type: 'test', id: id2, payload: {}},
        {type: 'test', id: id3, payload: {}},
      ]));

      return {..._, id1, id2, id3, el1, el2, el3};
    });

    should(`render the 0 item count correctly`, () => {
      run(_.el.setAttribute($.host._.contentIds, []));

      assert(_.el.getTextContent($.count)).to.emitWith('');
    });

    should(`render the 1 item count correctly`, () => {
      run(_.el.setAttribute($.host._.contentIds, [_.id1]));

      assert(_.el.getTextContent($.count)).to.emitWith('');
    });

    should(`render the 3 items count correctly`, () => {
      run(_.el.setAttribute($.host._.contentIds, [_.id1, _.id2, _.id3]));

      assert(_.el.getTextContent($.count)).to.emitWith('3');
    });
  });

  test('left$', () => {
    should(`render left correctly`, () => {
      const left = 123;
      const width = 456;
      const content = document.createElement('div');
      content.style.display = 'block';
      content.style.width = `${width}px`;

      const id = 'id';

      registerFakeStateHandler(
          new Map([[id, content]]),
          _.tester.vine,
      );
      _.fakeStateService.setStates(new Set([
        {type: 'test', id, payload: {}},
      ]));

      run(_.el.setAttribute($.host._.contentIds, [id]));

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.root._.left)).to.emitWith(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, init => {
    const _ = init(_ => {
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
      _.fakeStateService.setStates(new Set([
        {type: 'test', id: id1, payload: {}},
        {type: 'test', id: id2, payload: {}},
        {type: 'test', id: id3, payload: {}},
      ]));

      return {..._, id1, id2, id3, el1, el2, el3};
    });

    should(`remove the multiple classname if there are 0 items`, () => {
      run(_.el.setAttribute($.host._.contentIds, []));

      assert(_.el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });

    should(`remove the multiple classname if there is 1 item`, () => {
      run(_.el.setAttribute($.host._.contentIds, [_.id1]));

      assert(_.el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });

    should(`add the multiple classname if there are 3 items`, () => {
      run(_.el.setAttribute($.host._.contentIds, [_.id1, _.id2, _.id3]));

      assert(_.el.getClassList($.root)).to.emitWith(
          setThat<string>().haveExactElements(new Set(['multiple'])),
      );
    });
  });

  test('top$', () => {
    should(`render top correctly`, () => {
      const top = 123;
      const height = 456;
      const content = document.createElement('div');
      content.style.display = 'block';
      content.style.height = `${height}px`;

      const id = 'id';

      registerFakeStateHandler(
          new Map([[id, content]]),
          _.tester.vine,
      );
      _.fakeStateService.setStates(new Set([
        {type: 'test', id, payload: {}},
      ]));

      run(_.el.setAttribute($.host._.contentIds, [id]));

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.el.getStyle($.root._.top)).to.emitWith(`${top - height / 2}px`);
    });
  });

  test('computeAllRects', () => {
    should(`use the largest width and height`, () => {
      const size = 123;

      const content1 = document.createElement('div');
      content1.style.display = 'block';
      content1.style.width = `1px`;
      content1.style.height = `${size}px`;

      const content2 = document.createElement('div');
      content2.style.display = 'block';
      content2.style.height = `1px`;
      content2.style.width = `${size}px`;

      const id1 = 'id1';
      const id2 = 'id2';

      registerFakeStateHandler(
          new Map([[id1, content1], [id2, content2]]),
          _.tester.vine,
      );
      _.fakeStateService.setStates(new Set([
        {type: 'test', id: id1, payload: {}},
        {type: 'test', id: id2, payload: {}},
      ]));

      run(_.el.setAttribute($.host._.contentIds, [id1, id2]));

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.root._.left)).to.emitWith(`${-size / 2}px`);
      assert(_.el.getStyle($.root._.top)).to.emitWith(`${-size / 2}px`);
    });
  });
});

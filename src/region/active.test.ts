import { assert, run, setThat, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService, _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { IsContainer } from '../action/payload/is-container';
import { $objectSpecListId } from '../objects/object-spec-list';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { $, $active, Active, ACTIVE_ID } from './active';


test('@protoboard2/region/active', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Active], document);
    const el = tester.createElement($active.tag);
    run(el.setAttribute($.host._.objectId, ACTIVE_ID));

    const stateService = new StateService();
    $stateService.set(tester.vine, () => stateService);

    const $contentIds = stateService.add<readonly string[]>([]);
    const builder = fakeObjectSpecListBuilder();
    builder.add<IsContainer>({id: ACTIVE_ID, payload: {$contentIds}});

    const root = builder.build();
    const $rootId = stateService.add(root);
    $objectSpecListId.set(tester.vine, () => $rootId);

    // Need to add to body so the dimensions work.
    document.body.appendChild(el.element);

    return {$contentIds, $rootId, el, root, stateService, tester};
  });

  test('itemCount$', _, () => {
    should(`render the 0 item count correctly`, () => {
      _.stateService.set(_.$contentIds, []);

      assert(_.el.getTextContent($.count)).to.emitWith('');
    });

    should(`render the 1 item count correctly`, () => {
      _.stateService.set(_.$contentIds, ['id']);

      assert(_.el.getTextContent($.count)).to.emitWith('');
    });

    should(`render the 3 items count correctly`, () => {
      _.stateService.set(_.$contentIds, ['id1', 'id2', 'id3', 'id4', 'id5']);

      assert(_.el.getTextContent($.count)).to.emitWith('+2');
    });
  });

  test('left$', () => {
    should(`render left correctly`, () => {
      const left = 123;
      const width = 456;
      const content = document.createElement('div');
      content.style.display = 'block';
      content.style.width = `${width}px`;

      const contentId = 'contentId';
      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: contentId, createSpec: () => observableOf(content), payload: {}});
      _.stateService.set(_.$rootId, builder.build());

      _.stateService.set(_.$contentIds, [contentId]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.root._.left)).to.emitWith(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should(`remove the multiple classname if there are 0 items`, () => {
      _.stateService.set(_.$contentIds, []);

      assert(_.el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });

    should(`remove the multiple classname if there is 1 item`, () => {
      _.stateService.set(_.$contentIds, ['id']);

      assert(_.el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });

    should(`add the multiple classname if there are 3 items`, () => {
      _.stateService.set(_.$contentIds, ['id1', 'id2', 'id3', 'id4']);

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

      const contentId = 'contentId';
      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: contentId, createSpec: () => observableOf(content), payload: {}});
      _.stateService.set(_.$rootId, builder.build());

      _.stateService.set(_.$contentIds, [contentId]);

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

      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: id1, createSpec: () => observableOf(content1), payload: {}});
      builder.add({id: id2, createSpec: () => observableOf(content2), payload: {}});
      _.stateService.set(_.$rootId, builder.build());

      _.stateService.set(_.$contentIds, [id1, id2]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.root._.left)).to.emitWith(`${-size / 2}px`);
      assert(_.el.getStyle($.root._.top)).to.emitWith(`${-size / 2}px`);
    });
  });
});

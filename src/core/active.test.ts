import { assert, run, setThat, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService, _p } from 'mask';
import { setId } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { createIndexed, Indexed } from '../coordinate/indexed';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';
import { ContentSpec, IsContainer } from '../payload/is-container';

import { $, $active, Active, ACTIVE_ID } from './active';


test('@protoboard2/core/active', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Active], document);
    const el = tester.createElement($active.tag);
    el.setAttribute($.host._.objectId, ACTIVE_ID);

    const stateService = new StateService();
    $stateService.set(tester.vine, () => stateService);

    const $contentSpecs = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
    const builder = fakeObjectSpecListBuilder();
    builder.add<IsContainer<'indexed'>>({
      id: ACTIVE_ID,
      payload: {containerType: 'indexed', $contentSpecs},
    });
    const {$rootId, objectSpecList: root} = builder.build(stateService, tester.vine);

    // Need to add to body so the dimensions work.
    document.body.appendChild(el.element);

    return {$contentIds: $contentSpecs, $rootId, el, root, stateService, tester};
  });

  test('itemCount$', _, () => {
    should(`render the 0 item count correctly`, () => {
      _.stateService.set(_.$contentIds, []);

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should(`render the 1 item count correctly`, () => {
      _.stateService.set(_.$contentIds, [{objectId: 'id', coordinate: createIndexed(0)}]);

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should(`render the 3 items count correctly`, () => {
      _.stateService.set(
          _.$contentIds,
          [
            {objectId: 'id1', coordinate: createIndexed(0)},
            {objectId: 'id2', coordinate: createIndexed(1)},
            {objectId: 'id3', coordinate: createIndexed(2)},
            {objectId: 'id4', coordinate: createIndexed(3)},
            {objectId: 'id5', coordinate: createIndexed(4)},
          ],
      );

      assert(_.el.getTextContent($.count)).to.equal('+2');
    });
  });

  test('left$', () => {
    should(`render left correctly`, () => {
      const left = 123;
      const width = 456;
      const content = setId(document.createElement('div'), {});
      content.style.display = 'block';
      content.style.width = `${width}px`;

      const contentSpec = {objectId: 'contentId', coordinate: createIndexed(0)};
      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: contentSpec.objectId, payload: {}}, () => observableOf(content));
      builder.build(_.stateService, _.tester.vine);

      _.stateService.set(_.$contentIds, [contentSpec]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should(`remove the multiple classname if there are 0 items`, () => {
      _.stateService.set(_.$contentIds, []);

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should(`remove the multiple classname if there is 1 item`, () => {
      _.stateService.set(_.$contentIds, [{objectId: 'id', coordinate: createIndexed(0)}]);

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should(`add the multiple classname if there are 3 items`, () => {
      _.stateService.set(
          _.$contentIds,
          [
            {objectId: 'id1', coordinate: createIndexed(0)},
            {objectId: 'id2', coordinate: createIndexed(1)},
            {objectId: 'id3', coordinate: createIndexed(2)},
            {objectId: 'id4', coordinate: createIndexed(3)},
          ],
      );

      assert(_.el.getClassList($.root)).to.equal(
          setThat<string>().haveExactElements(new Set(['multiple'])),
      );
    });
  });

  test('top$', () => {
    should(`render top correctly`, () => {
      const top = 123;
      const height = 456;
      const content = setId(document.createElement('div'), {});
      content.style.display = 'block';
      content.style.height = `${height}px`;

      const contentSpec = {objectId: 'contentId', coordinate: createIndexed(0)};
      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: contentSpec.objectId, payload: {}}, () => observableOf(content));
      builder.build(_.stateService, _.tester.vine);

      _.stateService.set(_.$contentIds, [contentSpec]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.el.getStyle($.root._.top)).to.equal(`${top - height / 2}px`);
    });
  });

  test('computeAllRects', () => {
    should(`use the largest width and height`, () => {
      const size = 123;

      const content1 = setId(document.createElement('div'), {});
      content1.style.display = 'block';
      content1.style.width = `1px`;
      content1.style.height = `${size}px`;

      const content2 = setId(document.createElement('div'), {});
      content2.style.display = 'block';
      content2.style.height = `1px`;
      content2.style.width = `${size}px`;

      const spec1 = {objectId: 'id1', coordinate: createIndexed(0)};
      const spec2 = {objectId: 'id2', coordinate: createIndexed(1)};

      const builder = fakeObjectSpecListBuilder(_.root);
      builder.add({id: spec1.objectId, payload: {}}, () => observableOf(content1));
      builder.add({id: spec2.objectId, payload: {}}, () => observableOf(content2));
      builder.build(_.stateService, _.tester.vine);

      _.stateService.set(_.$contentIds, [spec1, spec2]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${-size / 2}px`);
      assert(_.el.getStyle($.root._.top)).to.equal(`${-size / 2}px`);
    });
  });
});

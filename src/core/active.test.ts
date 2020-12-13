import {assert, setThat, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService, _p} from 'mask';
import {renderNode, setId} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {$createSpecMap} from '../objects/object-service';
import {$$rootState, RootState} from '../objects/root-state';
import {fakeActiveSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';
import {ActiveSpec} from '../types/active-spec';

import {$, $active, Active} from './active';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));


test('@protoboard2/core/active', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Active], document);
    const stateService = new StateService();
    $stateService.set(tester.vine, () => stateService);

    const $contentSpecs = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);

    const $activeSpec = stateService.add<ActiveSpec>(fakeActiveSpec({
      payload: {
        containerType: 'indexed' as const,
        $contentSpecs,
      },
    }));
    const root = {
      $activeId: $activeSpec,
      containerIds: [],
      objectSpecIds: [$activeSpec],
    };
    const $rootState = stateService.add<RootState>(root);
    $$rootState.set(tester.vine, () => $rootState);

    // Need to add to body so the dimensions work.
    const el = tester.createElement($active.tag);
    el.setAttribute($.host._.objectId, $activeSpec);
    document.body.appendChild(el.element);

    return {$contentSpecs, $rootState, el, root, stateService, tester};
  });

  test('itemCount$', _, () => {
    should('render the 0 item count correctly', () => {
      _.stateService.set(_.$contentSpecs, []);

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should('render the 1 item count correctly', () => {
      const objectId = _.stateService.add(fakePieceSpec({payload: {}}));
      _.stateService.set(_.$contentSpecs, [{objectId, coordinate: createIndexed(0)}]);

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should('render the 3 items count correctly', () => {
      _.stateService.set(
          _.$contentSpecs,
          [
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(0),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(1),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(2),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(3),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(4),
            },
          ],
      );

      assert(_.el.getTextContent($.count)).to.equal('+2');
    });
  });

  test('left$', () => {
    should('render left correctly', () => {
      const testType = 'testType';
      const left = 123;
      const width = 456;
      const id = {};
      const content = setId(document.createElement('div'), id);
      content.style.display = 'block';
      content.style.width = `${width}px`;
      $createSpecMap.set(_.tester.vine, map => new Map([
        ...map,
        [testType, () => observableOf(renderNode({node: content, id}))],
      ]));

      // TODO: RootStateBuilder
      const $objectSpec = _.stateService.add(fakePieceSpec({payload: {}, type: testType}));
      const contentSpec = {
        objectId: $objectSpec,
        coordinate: createIndexed(0),
      };
      const root = {..._.root, objectSpecIds: [..._.root.objectSpecIds, $objectSpec]};
      _.stateService.set(_.$rootState, root);
      _.stateService.set(_.$contentSpecs, [contentSpec]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should('remove the multiple classname if there are 0 items', () => {
      _.stateService.set(_.$contentSpecs, []);

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should('remove the multiple classname if there is 1 item', () => {
      _.stateService.set(
          _.$contentSpecs,
          [{
            objectId: _.stateService.add(fakePieceSpec({payload: {}})),
            coordinate: createIndexed(0),
          },
          ]);

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should('add the multiple classname if there are 3 items', () => {
      _.stateService.set(
          _.$contentSpecs,
          [
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(0),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(1),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(2),
            },
            {
              objectId: _.stateService.add(fakePieceSpec({payload: {}})),
              coordinate: createIndexed(3),
            },
          ],
      );

      assert(_.el.getClassList($.root)).to.equal(
          setThat<string>().haveExactElements(new Set(['multiple'])),
      );
    });
  });

  test('top$', () => {
    should('render top correctly', () => {
      const top = 123;
      const height = 456;
      const testType = 'testType';
      const id = {};
      const content = setId(document.createElement('div'), id);
      content.style.display = 'block';
      content.style.height = `${height}px`;
      $createSpecMap.set(_.tester.vine, map => new Map([
        ...map,
        [testType, () => observableOf(renderNode({node: content, id}))],
      ]));

      // TODO: RootStateBuilder
      const $objectSpec = _.stateService.add(fakePieceSpec({payload: {}, type: testType}));
      const contentSpec = {
        objectId: $objectSpec,
        coordinate: createIndexed(0),
      };
      const root = {..._.root, objectSpecIds: [..._.root.objectSpecIds, $objectSpec]};
      _.stateService.set(_.$rootState, root);
      _.stateService.set(_.$contentSpecs, [contentSpec]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.el.getStyle($.root._.top)).to.equal(`${top - height / 2}px`);
    });
  });

  test('computeAllRects', () => {
    should('use the largest width and height', () => {
      const size = 123;
      const testType1 = 'testType1';
      const testType2 = 'testType2';

      const id1 = {};
      const content1 = setId(document.createElement('div'), id1);
      content1.style.display = 'block';
      content1.style.width = '1px';
      content1.style.height = `${size}px`;

      const id2 = {};
      const content2 = setId(document.createElement('div'), id2);
      content2.style.display = 'block';
      content2.style.height = '1px';
      content2.style.width = `${size}px`;

      $createSpecMap.set(_.tester.vine, map => new Map([
        ...map,
        [testType1, () => observableOf(renderNode({node: content1, id: id1}))],
        [testType2, () => observableOf(renderNode({node: content2, id: id2}))],
      ]));

      const $objectSpec1 = _.stateService.add(fakePieceSpec({payload: {}, type: testType1}));
      const spec1 = {
        objectId: $objectSpec1,
        coordinate: createIndexed(0),
      };
      const $objectSpec2 = _.stateService.add(fakePieceSpec({payload: {}, type: testType2}));
      const spec2 = {
        objectId: $objectSpec2,
        coordinate: createIndexed(1),
      };

      // TODO: RootStateBuilder
      const root = {
        ..._.root,
        objectSpecIds: [..._.root.objectSpecIds, $objectSpec1, $objectSpec2],
      };
      _.stateService.set(_.$rootState, root);
      _.stateService.set(_.$contentSpecs, [spec1, spec2]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${-size / 2}px`);
      assert(_.el.getStyle($.root._.top)).to.equal(`${-size / 2}px`);
    });
  });
});

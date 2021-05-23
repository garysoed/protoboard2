import {$stateService} from 'grapevine';
import {assert, setThat, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {_p} from 'mask';
import {renderNode, setId} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {createIndexed} from '../coordinate/indexed';
import {$registerRenderObject} from '../objects/render-object-spec';
import {ContentSpec} from '../payload/is-container';

import {$, Active, activeSpec} from './active';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));


test('@protoboard2/core/active', init => {
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const stateService = fakeStateService();
    const tester = factory.build({
      rootCtrls: [Active],
      rootDoc: document,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const $contentSpecs = stateService.modify(x => x.add<ReadonlyArray<ContentSpec<'indexed'>>>([]));

    const $activeSpec = stateService.modify(x => x.add(activeSpec({$contentSpecs})));
    const root = {
      $activeState: $activeSpec,
      containerIds: [],
      objectSpecIds: [$activeSpec],
    };

    // Need to add to body so the dimensions work.
    const el = tester.createElement(Active);
    el.setAttribute($.host._.objectId, $activeSpec);
    document.body.appendChild(el.element);

    return {$contentSpecs, el, root, stateService, tester};
  });

  test('itemCount$', _, () => {
    should('render the 0 item count correctly', () => {
      _.stateService.modify(x => x.set(_.$contentSpecs, []));

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should('render the 1 item count correctly', () => {
      const objectId = _.stateService.modify(x => x.add({}));
      _.stateService.modify(x => x.set(_.$contentSpecs, [{objectId, coordinate: createIndexed(0)}]));

      assert(_.el.getTextContent($.count)).to.equal('');
    });

    should('render the 3 items count correctly', () => {
      _.stateService.modify(x => x.set(
          _.$contentSpecs,
          [
            {
              objectId: x.add({}),
              coordinate: createIndexed(0),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(1),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(2),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(3),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(4),
            },
          ],
      ));

      assert(_.el.getTextContent($.count)).to.equal('+2');
    });
  });

  test('left$', () => {
    should('render left correctly', () => {
      const left = 123;
      const width = 456;
      const id = {};
      const content = setId(document.createElement('div'), id);
      content.style.display = 'block';
      content.style.width = `${width}px`;
      const $objectSpec = _.stateService.modify(x => x.add({}));
      $registerRenderObject.get(_.tester.vine)($objectSpec, () => observableOf(renderNode({node: content, id})));
      const contentSpec = {
        objectId: $objectSpec,
        coordinate: createIndexed(0),
      };
      _.stateService.modify(x => {
        x.set(_.$contentSpecs, [contentSpec]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should('remove the multiple classname if there are 0 items', () => {
      _.stateService.modify(x => x.set(_.$contentSpecs, []));

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should('remove the multiple classname if there is 1 item', () => {
      _.stateService.modify(x => x.set(
          _.$contentSpecs,
          [{
            objectId:x.add({}),
            coordinate: createIndexed(0),
          },
          ]),
      );

      assert(_.el.getClassList($.root)).to.equal(setThat<string>().beEmpty());
    });

    should('add the multiple classname if there are 3 items', () => {
      _.stateService.modify(x => x.set(
          _.$contentSpecs,
          [
            {
              objectId: x.add({}),
              coordinate: createIndexed(0),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(1),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(2),
            },
            {
              objectId: x.add({}),
              coordinate: createIndexed(3),
            },
          ],
      ));

      assert(_.el.getClassList($.root)).to.equal(
          setThat<string>().haveExactElements(new Set(['multiple'])),
      );
    });
  });

  test('top$', () => {
    should('render top correctly', () => {
      const top = 123;
      const height = 456;
      const id = {};
      const content = setId(document.createElement('div'), id);
      content.style.display = 'block';
      content.style.height = `${height}px`;

      const $objectSpec = _.stateService.modify(x => x.add({}));
      $registerRenderObject.get(_.tester.vine)($objectSpec, () => observableOf(renderNode({node: content, id})));

      const contentSpec = {
        objectId: $objectSpec,
        coordinate: createIndexed(0),
      };
      _.stateService.modify(x => {
        x.set(_.$contentSpecs, [contentSpec]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.el.getStyle($.root._.top)).to.equal(`${top - height / 2}px`);
    });
  });

  test('computeAllRects', () => {
    should('use the largest width and height', () => {
      const size = 123;

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

      const $objectSpec1 = _.stateService.modify(x => x.add({}));
      const spec1 = {
        objectId: $objectSpec1,
        coordinate: createIndexed(0),
      };
      const $objectSpec2 = _.stateService.modify(x => x.add({}));
      const spec2 = {
        objectId: $objectSpec2,
        coordinate: createIndexed(1),
      };

      const createSpecEntries$ = $registerRenderObject.get(_.tester.vine);
      createSpecEntries$($objectSpec1, () => observableOf(renderNode({node: content1, id: id1})));
      createSpecEntries$($objectSpec2, () => observableOf(renderNode({node: content2, id: id2})));

      _.stateService.modify(x => {
        x.set(_.$contentSpecs, [spec1, spec2]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.el.getStyle($.root._.left)).to.equal(`${-size / 2}px`);
      assert(_.el.getStyle($.root._.top)).to.equal(`${-size / 2}px`);
    });
  });
});

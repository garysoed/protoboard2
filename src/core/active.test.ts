import {$stateService} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {renderNode, setId} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {$registerRenderObject} from '../objects/render-object-spec';

import {Active, activeSpec} from './active';
import {$$activeSpec} from './active-spec';


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

    const contentsId = stateService.modify(x => x.add<ReadonlyArray<StateId<unknown>>>([]));

    stateService.modify(x => x.set($$activeSpec.get(tester.vine), activeSpec({contentsId})));

    // Need to add to body so the dimensions work.
    const {element, harness} = tester.createHarness(Active);
    document.body.appendChild(element);

    return {contentsId, harness, stateService, tester};
  });

  test('itemCount$', _, () => {
    should('render the 0 item count correctly', () => {
      _.stateService.modify(x => x.set(_.contentsId, []));

      assert(_.harness.count._.textContent).to.emitWith('');
    });

    should('render the 1 item count correctly', () => {
      const objectId = _.stateService.modify(x => x.add({}));
      _.stateService.modify(x => x.set(_.contentsId, [objectId]));

      assert(_.harness.count._.textContent).to.emitWith('');
    });

    should('render the 3 items count correctly', () => {
      _.stateService.modify(x => x.set(
          _.contentsId,
          [
            x.add({}),
            x.add({}),
            x.add({}),
            x.add({}),
            x.add({}),
          ],
      ));

      assert(_.harness.count._.textContent).to.emitWith('+2');
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
      const contentSpec = $objectSpec;
      _.stateService.modify(x => {
        x.set(_.contentsId, [contentSpec]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.harness.root._.left).to.emitWith(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should('remove the multiple classname if there are 0 items', () => {
      _.stateService.modify(x => x.set(_.contentsId, []));

      assert(_.harness.root._.classMultiple).to.emitWith(false);
    });

    should('remove the multiple classname if there is 1 item', () => {
      _.stateService.modify(x => x.set(
          _.contentsId,
          [x.add({})]),
      );

      assert(_.harness.root._.classMultiple).to.emitWith(false);
    });

    should('add the multiple classname if there are 3 items', () => {
      _.stateService.modify(x => x.set(
          _.contentsId,
          [
            x.add({}),
            x.add({}),
            x.add({}),
            x.add({}),
          ],
      ));

      assert(_.harness.root._.classMultiple).to.emitWith(true);
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

      const contentSpec = $objectSpec;
      _.stateService.modify(x => {
        x.set(_.contentsId, [contentSpec]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientY: top}));

      assert(_.harness.root._.top).to.emitWith(`${top - height / 2}px`);
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
      const $objectSpec2 = _.stateService.modify(x => x.add({}));

      const createSpecEntries$ = $registerRenderObject.get(_.tester.vine);
      createSpecEntries$($objectSpec1, () => observableOf(renderNode({node: content1, id: id1})));
      createSpecEntries$($objectSpec2, () => observableOf(renderNode({node: content2, id: id2})));

      _.stateService.modify(x => {
        x.set(_.contentsId, [$objectSpec1, $objectSpec2]);
      });

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.harness.root._.left).to.emitWith(`${-size / 2}px`);
      assert(_.harness.root._.top).to.emitWith(`${-size / 2}px`);
    });
  });
});

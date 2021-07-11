import {$stateService} from 'grapevine';
import {assert, run, should, test} from 'gs-testing';
import {fakeStateService, ObjectPath} from 'gs-tools/export/state';
import {_p} from 'mask';
import {renderNode, setId} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of, Subject} from 'rxjs';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {$registerRenderObject} from '../objects/render-object-spec';

import {Active} from './active';
import {$activeSpecPath} from './active-spec';


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

    const contents$ = new Subject<ReadonlyArray<ObjectPath<unknown>>>();
    run(contents$.pipe(stateService._($activeSpecPath.get(tester.vine)).$('contentsId').set()));
    contents$.next([]);

    // Need to add to body so the dimensions work.
    const {element, harness} = tester.createHarness(Active);
    document.body.appendChild(element);

    return {contents$, harness, stateService, tester};
  });

  test('itemCount$', _, () => {
    should('render the 0 item count correctly', () => {
      _.contents$.next([]);

      assert(_.harness.count._.textContent).to.emitWith('');
    });

    should('render the 1 item count correctly', () => {
      const objectPath = _.stateService.immutablePath(_.stateService.addRoot({}));
      _.contents$.next([objectPath]);

      assert(_.harness.count._.textContent).to.emitWith('');
    });

    should('render the 3 items count correctly', () => {
      _.contents$.next([
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
      ]);

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

      const objectPath = _.stateService.immutablePath(_.stateService.addRoot({}));
      $registerRenderObject.get(_.tester.vine)(objectPath, () => of(renderNode({node: content, id})));
      _.contents$.next([objectPath]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: left}));

      assert(_.harness.root._.left).to.emitWith(`${left - width / 2}px`);
    });
  });

  test('multipleItems$', _, () => {
    should('remove the multiple classname if there are 0 items', () => {
      _.contents$.next([]);

      assert(_.harness.root._.classMultiple).to.emitWith(false);
    });

    should('remove the multiple classname if there is 1 item', () => {
      const objectPath = _.stateService.immutablePath(_.stateService.addRoot({}));
      _.contents$.next([objectPath]);

      assert(_.harness.root._.classMultiple).to.emitWith(false);
    });

    should('add the multiple classname if there are 3 items', () => {
      _.contents$.next([
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
        _.stateService.immutablePath(_.stateService.addRoot({})),
      ]);

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

      const objectPath = _.stateService.immutablePath(_.stateService.addRoot({}));
      $registerRenderObject.get(_.tester.vine)(objectPath, () => of(renderNode({node: content, id})));
      _.contents$.next([objectPath]);

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

      const object1Path = _.stateService.immutablePath(_.stateService.addRoot({}));
      const object2Path = _.stateService.immutablePath(_.stateService.addRoot({}));

      const createSpecEntries$ = $registerRenderObject.get(_.tester.vine);
      createSpecEntries$(object1Path, () => of(renderNode({node: content1, id: id1})));
      createSpecEntries$(object2Path, () => of(renderNode({node: content2, id: id2})));

      _.contents$.next([object1Path, object2Path]);

      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 0, clientY: 0}));

      assert(_.harness.root._.left).to.emitWith(`${-size / 2}px`);
      assert(_.harness.root._.top).to.emitWith(`${-size / 2}px`);
    });
  });
});

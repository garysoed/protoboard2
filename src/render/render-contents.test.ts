import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {host, multi, renderNode, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getParent} from '../objects/content-map';
import {$registerRenderObject} from '../objects/render-object-spec';

import {renderContents} from './render-contents';


test('@protoboard2/render/render-contents', init => {
  const _ = init(() => {
    const slotName = 'slotName';
    const comment = document.createComment(slotName);
    const el = document.createElement('div');
    el.appendChild(comment);

    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const context = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });
    const $ = host({content: multi(slotName)});

    const [contentsId, $parentSpec] = stateService.modify(x => {
      const contentsId = x.add<ReadonlyArray<StateId<unknown>>>([]);
      return [
        contentsId,
        x.add({containerType: 'indexed', contentsId} as const),
      ];
    });
    run(renderContents($parentSpec, context.vine).pipe($._.content.output(context)));

    return {contentsId, context, el, $parentSpec, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const $object1 = _.stateService.modify(x => x.add({}));
      const $object1Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object1))),
      );
      const spec1 = $object1;

      const $object2 = _.stateService.modify(x => x.add({}));
      const $object2Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object2))),
      );
      const spec2 = $object2;

      const $object3 = _.stateService.modify(x => x.add({}));
      const $object3Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object3))),
      );
      const spec3 = $object3;

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});
      const createSpecEntries$ = $registerRenderObject.get(_.context.vine);
      createSpecEntries$($object1, () => observableOf(renderNode({node: el1, id: el1})));
      createSpecEntries$($object2, () => observableOf(renderNode({node: el2, id: el2})));
      createSpecEntries$($object3, () => observableOf(renderNode({node: el3, id: el3})));

      _.stateService.modify(x => x.set(_.contentsId, []));
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(null);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.contentsId, [spec1]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.contentsId, [spec1, spec2]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.contentsId, [spec1, spec2, spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      // renderContent should not modify the parents if they are removed.
      _.stateService.modify(x => x.set(_.contentsId, [spec1, spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.modify(x => x.set(_.contentsId, [spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.modify(x => x.set(_.contentsId, []));
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);
    });
  });
});

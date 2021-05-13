import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {fakeStateService} from 'gs-tools/export/state';
import {host, multi, renderNode, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {createIndexed} from '../coordinate/indexed';
import {$getParent} from '../objects/content-map';
import {$createSpecEntries} from '../objects/object-create-spec';
import {fakeContainerSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';

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

    const [$contentSpecs, $parentSpec] = stateService.modify(x => {
      const $contentSpecs = x.add<ReadonlyArray<ContentSpec<'indexed'>>>([]);
      return [
        $contentSpecs,
        x.add(fakeContainerSpec({payload: {containerType: 'indexed', $contentSpecs}})),
      ];
    });
    run(renderContents($parentSpec, context.vine).pipe($._.content.output(context)));

    return {$contentSpecs, context, el, $parentSpec, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const testType1 = 'testType1';
      const $object1 = _.stateService.modify(x => x.add(fakePieceSpec({payload: {}, type: testType1})));
      const $object1Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object1))),
      );
      const spec1 = {objectId: $object1, coordinate: createIndexed(0)};

      const testType2 = 'testType2';
      const $object2 = _.stateService.modify(x => x.add(fakePieceSpec({payload: {}, type: testType2})));
      const $object2Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object2))),
      );
      const spec2 = {objectId: $object2, coordinate: createIndexed(1)};

      const testType3 = 'testType3';
      const $object3 = _.stateService.modify(x => x.add(fakePieceSpec({payload: {}, type: testType3})));
      const $object3Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object3))),
      );
      const spec3 = {objectId: $object3, coordinate: createIndexed(2)};

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});
      const createSpecEntries$ = $createSpecEntries.get(_.context.vine);
      createSpecEntries$.next([testType1, () => observableOf(renderNode({node: el1, id: el1}))]);
      createSpecEntries$.next([testType2, () => observableOf(renderNode({node: el2, id: el2}))]);
      createSpecEntries$.next([testType3, () => observableOf(renderNode({node: el3, id: el3}))]);

      _.stateService.modify(x => x.set(_.$contentSpecs, []));
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(null);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.$contentSpecs, [spec1]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.$contentSpecs, [spec1, spec2]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(null);

      _.stateService.modify(x => x.set(_.$contentSpecs, [spec1, spec2, spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      // renderContent should not modify the parents if they are removed.
      _.stateService.modify(x => x.set(_.$contentSpecs, [spec1, spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.modify(x => x.set(_.$contentSpecs, [spec3]));
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.modify(x => x.set(_.$contentSpecs, []));
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);
    });
  });
});

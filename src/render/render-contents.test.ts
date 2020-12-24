import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {host, multi, renderNode, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {createIndexed} from '../coordinate/indexed';
import {activeSpec, ActiveSpec} from '../core/active';
import {$getParent} from '../objects/content-map';
import {$createSpecMap} from '../objects/object-create-spec';
import {$$rootState, RootState} from '../objects/root-state';
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
    const context = createFakeContext({shadowRoot});
    const $ = host({content: multi(slotName)});

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    const $contentSpecs = stateService.add<ReadonlyArray<ContentSpec<'indexed'>>>([]);
    const $parentSpec = stateService.add(
        fakeContainerSpec({payload: {containerType: 'indexed', $contentSpecs}}),
    );
    run(renderContents($parentSpec, context.vine).pipe($._.content.output(context)));

    return {$contentSpecs, context, el, $parentSpec, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const testType1 = 'testType1';
      const $object1 = _.stateService.add(fakePieceSpec({payload: {}, type: testType1}));
      const $object1Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object1))),
      );
      const spec1 = {objectId: $object1, coordinate: createIndexed(0)};

      const testType2 = 'testType2';
      const $object2 = _.stateService.add(fakePieceSpec({payload: {}, type: testType2}));
      const $object2Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object2))),
      );
      const spec2 = {objectId: $object2, coordinate: createIndexed(1)};

      const testType3 = 'testType3';
      const $object3 = _.stateService.add(fakePieceSpec({payload: {}, type: testType3}));
      const $object3Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object3))),
      );
      const spec3 = {objectId: $object3, coordinate: createIndexed(2)};

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});
      $createSpecMap.set(_.context.vine, map => new Map([
        ...map,
        [testType1, () => observableOf(renderNode({node: el1, id: el1}))],
        [testType2, () => observableOf(renderNode({node: el2, id: el2}))],
        [testType3, () => observableOf(renderNode({node: el3, id: el3}))],
      ]));

      const $root = _.stateService.add<RootState>({
        $activeState: _.stateService.add<ActiveSpec>(activeSpec({
          $contentSpecs: _.stateService.add([]),
        })),
        objectSpecIds: [
          $object1,
          $object2,
          $object3,
        ],
      });
      $$rootState.set(_.context.vine, () => $root);

      _.stateService.set(_.$contentSpecs, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(null);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.set(_.$contentSpecs, [spec1]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      _.stateService.set(_.$contentSpecs, [spec1, spec2]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(null);

      _.stateService.set(_.$contentSpecs, [spec1, spec2, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      // renderContent should not modify the parents if they are removed.
      _.stateService.set(_.$contentSpecs, [spec1, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.set(_.$contentSpecs, [spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);

      _.stateService.set(_.$contentSpecs, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(_.$parentSpec);
      assert($object2Parent).to.emitWith(_.$parentSpec);
      assert($object3Parent).to.emitWith(_.$parentSpec);
    });
  });
});

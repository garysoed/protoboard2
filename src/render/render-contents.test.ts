import {assert, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {host, multi, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of as observableOf, ReplaySubject} from 'rxjs';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {$createSpecMap} from '../objects/object-service';
import {$$rootState, RootState} from '../objects/root-state';
import {fakeActiveSpec, fakeContainerSpec, fakePieceSpec} from '../objects/testing/fake-object-spec';
import {ContentSpec} from '../payload/is-container';
import {ActiveSpec} from '../types/active-spec';
import {ContainerSpec} from '../types/container-spec';

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
    const containerSpec$ = new ReplaySubject<ContainerSpec<'indexed'>|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    run(renderContents(containerSpec$, $._.content, context));

    return {context, el, isContainer$: containerSpec$, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const testType1 = 'testType1';
      const $object1 = _.stateService.add(fakePieceSpec({payload: {}, type: testType1}));
      const spec1 = {objectId: $object1, coordinate: createIndexed(0)};

      const testType2 = 'testType2';
      const $object2 = _.stateService.add(fakePieceSpec({payload: {}, type: testType2}));
      const spec2 = {objectId: $object2, coordinate: createIndexed(1)};

      const testType3 = 'testType3';
      const $object3 = _.stateService.add(fakePieceSpec({payload: {}, type: testType3}));
      const spec3 = {objectId: $object3, coordinate: createIndexed(2)};

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});
      $createSpecMap.set(_.context.vine, map => new Map([
        ...map,
        [testType1, () => observableOf(el1)],
        [testType2, () => observableOf(el2)],
        [testType3, () => observableOf(el3)],
      ]));

      const $root = _.stateService.add<RootState>({
        $activeId: _.stateService.add<ActiveSpec>(fakeActiveSpec({
          payload: {
            containerType: 'indexed',
            $contentSpecs: _.stateService.add([]),
          },
        })),
        containerIds: [],
        objectSpecIds: [$object1, $object2, $object3],
      });
      $$rootState.set(_.context.vine, () => $root);

      const $contentSpecs = _.stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
      _.isContainer$.next(fakeContainerSpec({payload: {containerType: 'indexed', $contentSpecs}}));

      _.stateService.set($contentSpecs, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);

      _.stateService.set($contentSpecs, [spec1]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);

      _.stateService.set($contentSpecs, [spec1, spec2]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);

      _.stateService.set($contentSpecs, [spec1, spec2, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);

      _.stateService.set($contentSpecs, [spec1, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);

      _.stateService.set($contentSpecs, [spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);

      _.stateService.set($contentSpecs, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
    });

    should('render no children if state is null', () => {
      _.isContainer$.next(null);

      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
    });
  });
});

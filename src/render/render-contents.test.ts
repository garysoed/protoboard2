import {assert, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {host, multi, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject, of as observableOf} from 'rxjs';

import {Indexed, createIndexed} from '../coordinate/indexed';
import {FakeRootStateBuilder} from '../objects/testing/fake-object-spec-list-builder';
import {ContentSpec, IsContainer} from '../payload/is-container';

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
    const isContainer$ = new ReplaySubject<IsContainer<'indexed'>|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    run(renderContents(isContainer$, $._.content, context));

    return {context, el, isContainer$, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const spec1 = {objectId: 'id1', coordinate: createIndexed(0)};
      const spec2 = {objectId: 'id2', coordinate: createIndexed(1)};
      const spec3 = {objectId: 'id3', coordinate: createIndexed(2)};

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});

      const builder = new FakeRootStateBuilder({});
      builder.add({id: spec1.objectId, payload: {}}, () => observableOf(el1));
      builder.add({id: spec2.objectId, payload: {}}, () => observableOf(el2));
      builder.add({id: spec3.objectId, payload: {}}, () => observableOf(el3));
      builder.build(_.stateService, _.context.vine);

      const $contentSpecs = _.stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
      _.isContainer$.next({containerType: 'indexed', $contentSpecs});

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

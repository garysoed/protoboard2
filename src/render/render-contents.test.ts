import { assert, run, should, test } from 'gs-testing';
import { arrayFrom } from 'gs-tools/export/collect';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { host, multi } from 'persona';
import { createFakeContext } from 'persona/export/testing';
import { of as observableOf, ReplaySubject } from 'rxjs';

import { IsContainer } from '../action/payload/is-container';
import { $objectSpecListId, HasObjectSpecList } from '../objects/object-spec-list';

import { renderContents } from './render-contents';


test('@protoboard2/render/render-contents', init => {
  const _ = init(() => {
    const slotName = 'slotName';
    const comment = document.createComment(slotName);
    const el = document.createElement('div');
    el.appendChild(comment);

    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const $ = host({content: multi(slotName)});
    const isContainer$ = new ReplaySubject<IsContainer|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    run(renderContents(isContainer$, $._.content, context));

    return {context, el, isContainer$, stateService};
  });

  test('contents$', () => {
    should(`render the contents correctly`, () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';

      const el1 = document.createElement('div1');
      const el2 = document.createElement('div2');
      const el3 = document.createElement('div3');

      const objectSpecs = [
        {id: id1, createSpec: () => observableOf(el1), payload: {}},
        {id: id2, createSpec: () => observableOf(el2), payload: {}},
        {id: id3, createSpec: () => observableOf(el3), payload: {}},
      ];
      const $rootId = _.stateService.add<HasObjectSpecList>({objectSpecs});
      $objectSpecListId.set(_.context.vine, () => $rootId);

      const $contentIds = _.stateService.add<readonly string[]>([]);
      _.isContainer$.next({$contentIds});

      _.stateService.set($contentIds, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);

      _.stateService.set($contentIds, [id1]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);

      _.stateService.set($contentIds, [id1, id2]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);

      _.stateService.set($contentIds, [id1, id2, id3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);

      _.stateService.set($contentIds, [id1, id3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);

      _.stateService.set($contentIds, [id3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);

      _.stateService.set($contentIds, []);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
    });

    should(`render no children if state is null`, () => {
      _.isContainer$.next(null);

      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
    });
  });
});

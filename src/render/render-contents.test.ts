import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
import {host, multi, renderNode, setId} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getParent} from '../objects/content-map';
import {$registerRenderObject} from '../objects/render-object-spec';
import {IsContainer} from '../payload/is-container';

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

    const parentSpecId = stateService.addRoot<IsContainer>({
      contentsId: mutableState([]),
    });
    const parentSpecPath = stateService.immutablePath(parentSpecId);

    run(renderContents(parentSpecPath, context.vine).pipe($._.content.output(context)));

    return {context, el, parentSpecPath, stateService};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const $object1 = _.stateService.immutablePath(_.stateService.addRoot({}));
      const $object1Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object1))),
      );
      const spec1 = $object1;

      const $object2 = _.stateService.immutablePath(_.stateService.addRoot({}));
      const $object2Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object2))),
      );
      const spec2 = $object2;

      const $object3 = _.stateService.immutablePath(_.stateService.addRoot({}));
      const $object3Parent = createSpySubject(
          $getParent.get(_.context.vine).pipe(map(getFn => getFn($object3))),
      );
      const spec3 = $object3;

      const el1 = setId(document.createElement('div1'), {});
      const el2 = setId(document.createElement('div2'), {});
      const el3 = setId(document.createElement('div3'), {});
      const createSpecEntries$ = $registerRenderObject.get(_.context.vine);
      createSpecEntries$($object1, () => of(renderNode({node: el1, id: el1})));
      createSpecEntries$($object2, () => of(renderNode({node: el2, id: el2})));
      createSpecEntries$($object3, () => of(renderNode({node: el3, id: el3})));

      const onSetContentsId$ = new Subject<ReadonlyArray<ObjectPath<unknown>>>();
      run(onSetContentsId$.pipe(_.stateService._(_.parentSpecPath).$('contentsId').set()));

      onSetContentsId$.next([]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(null);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      onSetContentsId$.next([spec1]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(null);
      assert($object3Parent).to.emitWith(null);

      onSetContentsId$.next([spec1, spec2]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(_.parentSpecPath);
      assert($object3Parent).to.emitWith(null);

      onSetContentsId$.next([spec1, spec2, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el2, el3]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(_.parentSpecPath);
      assert($object3Parent).to.emitWith(_.parentSpecPath);

      // renderContent should not modify the parents if they are removed.
      onSetContentsId$.next([spec1, spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el1, el3]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(_.parentSpecPath);
      assert($object3Parent).to.emitWith(_.parentSpecPath);

      onSetContentsId$.next([spec3]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([el3]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(_.parentSpecPath);
      assert($object3Parent).to.emitWith(_.parentSpecPath);

      onSetContentsId$.next([]);
      assert(arrayFrom(_.el.children)).to.haveExactElements([]);
      assert($object1Parent).to.emitWith(_.parentSpecPath);
      assert($object2Parent).to.emitWith(_.parentSpecPath);
      assert($object3Parent).to.emitWith(_.parentSpecPath);
    });
  });
});

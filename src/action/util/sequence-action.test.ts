import { assert, run, should, teardown, test } from 'gs-testing';
import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { _v } from 'mask';
import { AttributeChangedEvent, mutationObservable } from 'persona';
import { createFakeContext, installFakeMutationObserver } from 'persona/export/testing';
import { of as observableOf, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { $face } from '../face';
import { FlipAction } from '../flip-action';

import { SequenceAction } from './sequence-action';


test('@protoboard2/action/util/sequence-action', init => {
  const _ = init(() => {
    const uninstallFakeMutationObserver = installFakeMutationObserver();
    return {uninstallFakeMutationObserver};
  });

  teardown(() => {
    _.uninstallFakeMutationObserver();
  });

  test('trigger', () => {
    should(`apply the given actions to the target element`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const vine = _v.build('test');
      const action = new SequenceAction(
          'test',
          'Test',
          [
            new FlipAction(2, 0, vine),
            new FlipAction(3, 0, vine),
          ],
          vine,
      );

      const onAttributeChanged$ = new Subject<AttributeChangedEvent>();
      run(mutationObservable(el, {attributes: true})
          .pipe(
              switchMap(records => {
                const attrNameList = $pipe(
                    records,
                    $map(({attributeName}) => attributeName),
                    $filterNonNull(),
                    $map(attrName => ({attrName})),
                    $asArray(),
                );
                return observableOf(...attrNameList);
              }),
              tap(event => {
                onAttributeChanged$.next(event);
              }),
          ));
      action.setActionContext(createFakeContext({onAttributeChanged$, shadowRoot}));
      run(action.run());

      action.trigger();

      // The first flip sets the face to 1, the second sets it to 2. If the flip actions are
      // reversed, the first flip will set to 1, the second will set to 0.
      assert(el.getAttribute($face.currentFaceOut.attrName)).to.equal('2');
    });
  });
});

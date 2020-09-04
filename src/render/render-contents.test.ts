import { arrayThat, assert, createSpySubject, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { Subject } from 'rxjs';

import { createFakeStateService } from '../state/testing/fake-state-service';
import { registerFakeStateHandler } from '../state/testing/register-fake-state-handler';

import { renderContents } from './render-contents';


test('@protoboard2/render/render-contents', () => {
  test('contents$', () => {
    should(`render the contents correctly`, () => {
      const contentIds$ = new Subject<readonly string[]>();
      const state = {id: 'id', type: 'type', payload: {contentIds: contentIds$}};
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const context = createFakeContext({shadowRoot});
      const fakeStateService = createFakeStateService(context.vine);

      const contents$ = createSpySubject(renderContents(state, context));
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';

      const el1 = document.createElement('div1');
      const el2 = document.createElement('div2');
      const el3 = document.createElement('div3');

      registerFakeStateHandler(
          new Map([[id1, el1], [id2, el2], [id3, el3]]),
          context.vine,
      );

      fakeStateService.addState({type: 'test', id: id1, payload: {}});
      fakeStateService.addState({type: 'test', id: id2, payload: {}});
      fakeStateService.addState({type: 'test', id: id3, payload: {}});

      contentIds$.next([]);
      contentIds$.next([id1]);
      contentIds$.next([id1, id2]);
      contentIds$.next([id1, id2, id3]);
      contentIds$.next([id1, id3]);
      contentIds$.next([id3]);
      contentIds$.next([]);

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
        arrayThat<Element>().haveExactElements([el1]),
        arrayThat<Element>().haveExactElements([el1, el2]),
        arrayThat<Element>().haveExactElements([el1, el2, el3]),
        arrayThat<Element>().haveExactElements([el1, el3]),
        arrayThat<Element>().haveExactElements([el3]),
        arrayThat<Element>().haveExactElements([]),
      ]);
    });

    should(`render return empty array if state is null`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const context = createFakeContext({shadowRoot});

      const contents$ = createSpySubject(renderContents(null, context));

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
      ]);
    });
  });
});

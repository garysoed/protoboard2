import { Vine } from '@grapevine';
import { assert, setup, should, test } from '@gs-testing';
import { _v } from '@mask';
import { EMPTY, Observable, ReplaySubject, Subject } from '@rxjs';
import { BaseAction } from './base-action';
import { TriggerSpec, TriggerType } from './trigger-spec';

class TestAction extends BaseAction {
  constructor(
      defaultTriggerSpec: TriggerSpec,
      private readonly onTrigger$: Subject<{}>,
  ) {
    super(defaultTriggerSpec);
  }

  onTrigger(vine: Vine, root: ShadowRoot): Observable<unknown> {
    this.onTrigger$.next({vine, root});

    return EMPTY;
  }
}

test('@protoboard2/core/base-action', () => {
  let spec$: ReplaySubject<TriggerSpec>;
  let vine: Vine;

  setup(() => {
    spec$ = new ReplaySubject(1);
    vine = _v.build('test');
  });

  test('setupClick', () => {
    should(`emit correctly when clicked`, () => {
      const onTrigger$ = new ReplaySubject<{}>(1);
      const action = new TestAction({type: TriggerType.CLICK}, onTrigger$);
      const element = document.createElement('div');

      action.install()(vine, element.attachShadow({mode: 'open'})).subscribe();

      element.dispatchEvent(new CustomEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('setupKey', () => {
    const KEY = 'p';
    let onTrigger$: ReplaySubject<{}>;
    let action: TestAction;

    setup(() => {
      onTrigger$ = new ReplaySubject<{}>(1);
      action = new TestAction({type: TriggerType.KEY, key: KEY}, onTrigger$);
    });

    should(`emit when hovered and the correct key was pressed`, () => {
      const element = document.createElement('div');
      action.install()(vine, element.attachShadow({mode: 'open'})).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(onTrigger$).to.emit();
    });

    should(`not emit when the wrong key was pressed`, () => {
      const element = document.createElement('div');
      action.install()(vine, element.attachShadow({mode: 'open'})).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(onTrigger$).toNot.emit();
    });

    should(`not emit when not hovered`, () => {
      const element = document.createElement('div');
      action.install()(vine, element.attachShadow({mode: 'open'})).subscribe();

      // Hover over the element, then hover off.
      element.dispatchEvent(new CustomEvent('mouseover'));
      element.dispatchEvent(new CustomEvent('mouseout'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(onTrigger$).toNot.emit();
    });
  });
});

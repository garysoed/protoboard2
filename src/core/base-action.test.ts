import { Vine } from 'grapevine';
import { assert, setup, should, test } from 'gs-testing';
import { _v } from 'mask';
import { integerParser } from 'persona';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BaseAction } from './base-action';
import { TriggerKey, TriggerSpec, TriggerType } from './trigger-spec';


class TestAction extends BaseAction<{value: number}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(
      defaultTriggerSpec: TriggerSpec,
      private readonly onTrigger$: Subject<{}>,
  ) {
    super('test', 'Test', {value: integerParser()}, defaultTriggerSpec);
  }

  onTrigger(trigger$: Observable<unknown>): Observable<unknown> {
    return trigger$.pipe(
        tap(() => this.onTrigger$.next({})),
    );
  }

  protected onConfig(config$: Observable<Partial<{value: number}>>): Observable<unknown> {
    return config$.pipe(
        tap(config => {
          if (config.value) {
            this.value$.next(config.value);
          }
        }),
    );
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

      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      element.dispatchEvent(new CustomEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('setupConfig', () => {
    let onTrigger$: ReplaySubject<{}>;
    let action: TestAction;

    setup(() => {
      onTrigger$ = new ReplaySubject<{}>(1);
      action = new TestAction({type: TriggerType.KEY, key: TriggerKey.P}, onTrigger$);
    });

    should(`update the configuration when element is added`, () => {
      const element = document.createElement('div');
      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      element.appendChild(configEl);

      assert(action.value$).to.emitSequence([123]);
    });

    should(`update the configuration when attribute has changed`, () => {
      const element = document.createElement('div');

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      element.appendChild(configEl);

      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      configEl.setAttribute('value', '345');

      assert(action.value$).to.emitSequence([345]);
    });

    should(`update the trigger configuration correctly`, () => {
      const element = document.createElement('div');

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('trigger', 'click');
      element.appendChild(configEl);

      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      element.dispatchEvent(new CustomEvent('click'));

      configEl.setAttribute('value', '345');

      assert(action.value$).to.emitSequence([345]);
    });
  });

  test('setupTriggerKey', () => {
    const KEY = TriggerKey.P;
    let onTrigger$: ReplaySubject<{}>;
    let action: TestAction;

    setup(() => {
      onTrigger$ = new ReplaySubject<{}>(1);
      action = new TestAction({type: TriggerType.KEY, key: KEY}, onTrigger$);
    });

    should(`emit when hovered and the correct key was pressed`, () => {
      const element = document.createElement('div');
      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(onTrigger$).to.emit();
    });

    should(`not emit when the wrong key was pressed`, () => {
      const element = document.createElement('div');
      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(onTrigger$).toNot.emit();
    });

    should(`not emit when not hovered`, () => {
      const element = document.createElement('div');
      action.install(element.attachShadow({mode: 'open'}), vine).subscribe();

      // Hover over the element, then hover off.
      element.dispatchEvent(new CustomEvent('mouseover'));
      element.dispatchEvent(new CustomEvent('mouseout'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(onTrigger$).toNot.emit();
    });
  });
});

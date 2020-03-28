import { assert, should, test } from 'gs-testing';
import { _v } from 'mask';
import { integerParser } from 'persona';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BaseAction } from './base-action';
import { TriggerKey, TriggerSpec, TriggerType } from './trigger-spec';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{value: number}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(
      defaultTriggerSpec: TriggerSpec,
      private readonly onTrigger$: Subject<{}>,
  ) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, defaultTriggerSpec);
  }

  setupHandleTrigger(trigger$: Observable<unknown>): Observable<unknown> {
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

test('@protoboard2/core/base-action', init => {
  const _ = init(() => {
    const spec$ = new ReplaySubject(1);
    const vine = _v.build('test');
    return {spec$, vine};
  });

  test('setupClick', () => {
    should(`emit correctly when clicked`, () => {
      const onTrigger$ = new ReplaySubject<{}>(1);
      const action = new TestAction({type: TriggerType.CLICK}, onTrigger$);
      const element = document.createElement('div');

      action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      element.dispatchEvent(new CustomEvent('click'));

      assert(onTrigger$).to.emit();
    });
  });

  test('setupConfig', _, init => {
    const _ = init(_ => {
      const onTrigger$ = new ReplaySubject<{}>(1);
      const action = new TestAction({type: TriggerType.KEY, key: TriggerKey.P}, onTrigger$);
      return {..._, onTrigger$, action};
    });

    should(`update the configuration when element is added`, () => {
      const element = document.createElement('div');
      _.action
          .install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine})
          .subscribe();

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      element.appendChild(configEl);

      assert(_.action.value$).to.emitSequence([123]);
    });

    should(`update the configuration when attribute has changed`, () => {
      const element = document.createElement('div');

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      element.appendChild(configEl);

      _.action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      configEl.setAttribute('value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });

    should(`update the trigger configuration correctly`, () => {
      const element = document.createElement('div');

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('trigger', 'click');
      element.appendChild(configEl);

      _.action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      element.dispatchEvent(new CustomEvent('click'));

      configEl.setAttribute('value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });
  });

  test('setupTriggerFunction', () => {
    should(`create a function that triggers`, () => {
      const onTrigger$ = new ReplaySubject<{}>(1);
      const action = new TestAction({type: TriggerType.KEY, key: TriggerKey.P}, onTrigger$);
      const element = document.createElement('div');
      action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      (element as any)[ACTION_KEY]();

      assert(onTrigger$).to.emit();
    });
  });

  test('setupTriggerKey', _, init => {
    const KEY = TriggerKey.P;

    const _ = init(_ => {
      const onTrigger$ = new ReplaySubject<{}>(1);
      const action = new TestAction({type: TriggerType.KEY, key: KEY}, onTrigger$);
      return {..._, action, onTrigger$};
    });

    should(`emit when hovered and the correct key was pressed`, () => {
      const element = document.createElement('div');
      _.action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).to.emit();
    });

    should(`not emit when the wrong key was pressed`, () => {
      const element = document.createElement('div');
      _.action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      // Hover over the element.
      element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(_.onTrigger$).toNot.emit();
    });

    should(`not emit when not hovered`, () => {
      const element = document.createElement('div');
      _.action.install({shadowRoot: element.attachShadow({mode: 'open'}), vine: _.vine}).subscribe();

      // Hover over the element, then hover off.
      element.dispatchEvent(new CustomEvent('mouseover'));
      element.dispatchEvent(new CustomEvent('mouseout'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).toNot.emit();
    });
  });
});

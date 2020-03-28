import { Vine } from 'grapevine';
import { assert, should, test } from 'gs-testing';
import { _v } from 'mask';
import { integerParser, PersonaContext } from 'persona';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseAction } from './base-action';
import { TriggerKey, TriggerSpec, TriggerType } from './trigger-spec';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{value: number}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(
      defaultTriggerSpec: TriggerSpec,
      context: PersonaContext,
  ) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, defaultTriggerSpec, context);

    this.setupConfig();
  }

  get onTriggerOut$(): Observable<unknown> {
    return this.onTrigger$;
  }

  private setupConfig(): void {
    this.config$
        .pipe(takeUntil(this.onDispose$))
        .subscribe(config => {
          if (config.value) {
            this.value$.next(config.value);
          }
        });
  }
}

interface TestState {
  readonly action: TestAction;
  readonly element: HTMLElement;
  readonly onTrigger$: Observable<unknown>;
  readonly vine: Vine;
}

test('@protoboard2/core/base-action', init => {
  function setupTest(triggerSpec: TriggerSpec): TestState {
    const vine = _v.build('test');

    const element = document.createElement('div');
    const shadowRoot = element.attachShadow({mode: 'open'});

    const onTrigger$ = new ReplaySubject(1);
    const action = new TestAction(triggerSpec, {shadowRoot, vine});
    action.onTriggerOut$.subscribe(onTrigger$);

    return {action, element, onTrigger$, vine};
  }

  const _ = init(() => {
    return setupTest({type: TriggerType.CLICK});
  });

  test('setupClick', () => {
    should(`emit correctly when clicked`, () => {
      _.element.dispatchEvent(new CustomEvent('click'));

      assert(_.onTrigger$).to.emit();
    });
  });

  test('setupConfig', () => {

    should(`update the configuration when element is added`, () => {
      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      _.element.appendChild(configEl);

      assert(_.action.value$).to.emitSequence([123]);
    });

    should(`update the configuration when attribute has changed`, () => {
      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('value', '123');
      _.element.appendChild(configEl);

      configEl.setAttribute('value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });

    should(`update the trigger configuration correctly`, () => {
      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'test');
      configEl.setAttribute('trigger', 'click');
      _.element.appendChild(configEl);

      _.element.dispatchEvent(new CustomEvent('click'));

      configEl.setAttribute('value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });
  });

  test('setupTriggerFunction', () => {
    should(`create a function that triggers`, () => {
      (_.element as any)[ACTION_KEY]();

      assert(_.onTrigger$).to.emit();
    });
  });

  test('setupTriggerKey', _, init => {
    const KEY = TriggerKey.P;

    const _ = init(_ => {
      return setupTest({type: TriggerType.KEY, key: KEY});
    });

    should(`emit when hovered and the correct key was pressed`, () => {
      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).to.emit();
    });

    should(`not emit when the wrong key was pressed`, () => {
      // Hover over the element.
      _.element.dispatchEvent(new CustomEvent('mouseover'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'o'}));

      assert(_.onTrigger$).toNot.emit();
    });

    should(`not emit when not hovered`, () => {
      // Hover over the element, then hover off.
      _.element.dispatchEvent(new CustomEvent('mouseover'));
      _.element.dispatchEvent(new CustomEvent('mouseout'));

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: KEY}));

      assert(_.onTrigger$).toNot.emit();
    });
  });
});

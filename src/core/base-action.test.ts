import { Vine } from 'grapevine';
import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { _v } from 'mask';
import { integerParser } from 'persona';
import { createFakeContext, PersonaTester, PersonaTesterEnvironment } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BaseAction } from './base-action';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{value: number}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(vine: Vine) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, vine);

    this.addSetup(this.setupConfig());
  }

  get onTriggerOut$(): Observable<unknown> {
    return this.onTrigger$;
  }

  private setupConfig(): Observable<unknown> {
    return this.config$
        .pipe(
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
    runEnvironment(new PersonaTesterEnvironment());
    const vine = _v.build('test');

    const element = document.createElement('div');
    const shadowRoot = element.attachShadow({mode: 'open'});

    const action = new TestAction(vine);
    action.setActionContext(createFakeContext({shadowRoot}));
    run(action.run());
    const onTrigger$ = createSpySubject(action.onTriggerOut$);

    return {action, element, onTrigger$, vine};
  });

  test('config$', () => {
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
});

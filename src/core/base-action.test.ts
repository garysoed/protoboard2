import { Vine } from 'grapevine';
import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { _v } from 'mask';
import { integerParser, PersonaContext } from 'persona';
import { createFakeContext, PersonaTester, PersonaTesterEnvironment } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BaseAction } from './base-action';


const ACTION_KEY = 'test';

class TestAction extends BaseAction<{value: number}> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(context: PersonaContext) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, context);

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

    const element = document.createElement('div');
    const shadowRoot = element.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});

    const action = new TestAction(context);
    const onTrigger$ = createSpySubject(action.onTriggerOut$);

    return {action, context, element, onTrigger$};
  });

  test('config$', _, init => {
    const _ = init(_ => {
      run(_.action.run());
      return _;
    });

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

  test('objectId$', () => {
    should(`emit the object ID if exists`, () => {
      const objectId = 'objectId';
      _.element.setAttribute('object-id', objectId);

      run(_.action.run());

      const objectId$ = createSpySubject(_.action.objectId$);
      assert(objectId$).to.emitSequence([objectId]);
    });

    should(`emit nothing if the object ID does not exist`, () => {
      run(_.action.run());

      const objectId$ = createSpySubject(_.action.objectId$);
      assert(objectId$).to.emitSequence([]);
    });
  });
});

import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { integerParser } from 'persona';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { createFakeActionContext } from '../action/testing/fake-action-context';
import { ObjectSpec } from '../state-old/object-spec';

import { ActionContext, BaseAction } from './base-action';


const ACTION_KEY = 'test';
const DEFAULT_CONFIG_VALUE = 234;

interface ActionConfig {
  readonly value: number;
}

class TestAction extends BaseAction<{}, ActionConfig> {
  readonly value$ = new ReplaySubject<number>(1);

  constructor(context: ActionContext<{}>) {
    super(ACTION_KEY, 'Test', {value: integerParser()}, context, {value: DEFAULT_CONFIG_VALUE});

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
    const personaContext = createFakeContext({shadowRoot});
    const state$ = new ReplaySubject<ObjectSpec<{}>>(1);

    const action = new TestAction(createFakeActionContext({
      personaContext,
      state$,
    }));
    const onTrigger$ = createSpySubject(action.onTriggerOut$);

    return {action, personaContext, element, onTrigger$};
  });

  test('config$', _, init => {
    const _ = init(_ => {
      run(_.action.run());
      return _;
    });

    should(`update the configuration when attribute is specified`, () => {
      _.element.setAttribute('pb-test-value', '123');

      assert(_.action.value$).to.emitSequence([123]);
    });

    should(`use the default config if config attribute does not exist`, () => {
      assert(_.action.value$).to.emitSequence([DEFAULT_CONFIG_VALUE]);
    });

    should(`update the configuration when attribute has changed`, () => {
      _.element.setAttribute('pb-test-value', '123');
      _.element.setAttribute('pb-test-value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });

    should(`update the trigger configuration correctly`, () => {
      _.element.setAttribute('pb-test-trigger', 'click');

      _.element.dispatchEvent(new CustomEvent('click'));

      _.element.setAttribute('pb-test-value', '345');

      assert(_.action.value$).to.emitSequence([345]);
    });
  });
});

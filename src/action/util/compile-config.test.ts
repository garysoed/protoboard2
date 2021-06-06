import {assert, createSpySubject, objectThat, should, test} from 'gs-testing';
import {constantIn, host} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../../core/trigger-spec';

import {compileConfig} from './compile-config';


interface TestValue {
  readonly a: number;
  readonly b: string;
  readonly trigger: {type: TriggerType};
}

test('@protoboard2/src/action/util/compile-config', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context};
  });

  should('update the configuration when attribute is specified', () => {
    const value$ = createSpySubject(
        compileConfig(
            host({
              a: constantIn(of(123)),
              b: constantIn(of('abc')),
              trigger: constantIn(of({type: TriggerType.D})),
            })._,
            _.context,
        ),
    );

    assert(value$).to.emitWith(objectThat<TestValue>().haveProperties({
      a: 123,
      b: 'abc',
      trigger: objectThat<{type: TriggerType}>().haveProperties({
        type: TriggerType.D,
      }),
    }));
  });
});
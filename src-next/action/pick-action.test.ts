import {arrayThat, assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {Context, Ctrl, DIV, id, itarget, ivalue, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import {$activeState} from '../core/active-spec';
import {onTrigger} from '../trigger/trigger';
import {TriggerType} from '../types/trigger-spec';

import {pickAction} from './pick-action';


const $test = {
  host: {
    id: ivalue('stateId', instanceofType(Object), {}),
  },
  shadow: {
    div: id('div', DIV, {
      target: itarget(),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.div.target.pipe(
          onTrigger(of({type: TriggerType.CLICK})),
          pickAction(this.$, this.$.host.id),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="div"></div>',
});

test('@protoboard2/src/action/pick-action', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('add the ID to activeState\'s content IDs', () => {
    const id = {};
    const element = _.tester.createElement(TEST);
    element.stateId = id;

    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick();

    assert($activeState.get(_.tester.vine).$('contentIds')).to.emitSequence([
      arrayThat<{}>().haveExactElements([id]),
    ]);
  });
});
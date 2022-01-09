import {$stateService} from 'grapevine';
import {arrayThat, assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Context, DIV, id, itarget, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import {$activeState} from '../core/active-spec';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {onTrigger} from '../trigger/trigger';
import {ComponentState} from '../types/component-state';
import {TriggerType} from '../types/trigger-spec';

import {pickAction} from './pick-action';


const $test = {
  host: {
    ...create$baseComponent().host,
  },
  shadow: {
    div: id('div', DIV, {
      target: itarget(),
    }),
  },
};

class Test extends BaseComponent<ComponentState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($);
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.div.target.pipe(
          onTrigger(of({type: TriggerType.CLICK})),
          pickAction(this.$),
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
    const stateService = $stateService.get(_.tester.vine);
    const state = stateService.addRoot<ComponentState>({id})._();
    const element = _.tester.createElement(TEST);
    element.state = state;

    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick();

    assert($activeState.get(_.tester.vine).$('contentIds')).to.emitSequence([
      arrayThat<{}>().haveExactElements([id]),
    ]);
  });
});
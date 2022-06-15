import {$stateService} from 'grapevine';
import {arrayThat, assert, objectThat, run, should, test} from 'gs-testing';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, ivalue, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {componentId} from '../id/component-id';
import {stampId} from '../id/stamp-id';
import {onTrigger} from '../trigger/trigger';
import {TriggerType} from '../types/trigger-spec';

import {PadContentType, PadState, StampState} from './pad-state';
import {stampActionFactory, StampActionInput, STAMP_ACTION_INPUT_TYPE, STAMP_CONFIG_TYPE} from './stamp-action';

const $test = {
  host: {
    ...create$baseComponent<PadState>().host,
    config: ivalue('config', STAMP_CONFIG_TYPE),
    stamp: icall<[StampActionInput], 'stamp'>('stamp', [STAMP_ACTION_INPUT_TYPE]),
  },
  shadow: {
    root: query('div', DIV, {
      target: itarget(),
    }),
  },
};

class Test extends BaseComponent<PadState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, 'Test pad');
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$.host.config.pipe(
          switchMap(config => {
            if (!config) {
              return EMPTY;
            }
            const onTrigger$ = this.$.shadow.root.target.pipe(onTrigger(of(config)));
            const onCall$ = this.$.host.stamp;

            return merge(onTrigger$, onCall$).pipe(
                stampActionFactory(config)(this.$),
            );
          }),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  tag: 'pbt-pad',
  ctrl: Test,
  spec: $test,
  template: '<div></div>',
});

test('@protoboard2/src-next/pad/stamp-action', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});

    const state = $stateService.get(tester.vine).addRoot<PadState>({
      id: componentId('id'),
      contents: mutableState([]),
    })._();

    return {state, tester};
  });

  should('add the new stamp when triggered from trigger event', () => {
    const id = stampId('id');
    const stampName = 'test stamp';
    const config = {
      stampId: id,
      stampName,
      type: TriggerType.CLICK,
    };

    const otherStamp1 = {type: PadContentType.STAMP, stampId: stampId('id1'), x: 12, y: 23};
    const otherStamp2 = {type: PadContentType.STAMP, stampId: stampId('id2'), x: 34, y: 45};
    const otherStamp3 = {type: PadContentType.STAMP, stampId: stampId('id3'), x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(_.state.$('contents').set()));

    const element = _.tester.createElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick({clientX: 123, clientY: 456});

    assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
      otherStamp3,
      objectThat<StampState>().haveProperties({stampId: id, x: 123, y: 456}),
    ]));
  });

  should('add the new stamp when triggered from function call', () => {
    const id = stampId('id');
    const stampName = 'test stamp';
    const config = {
      stampId: id,
      stampName,
      type: TriggerType.CLICK,
    };

    const otherStamp1 = {type: PadContentType.STAMP, stampId: stampId('id1'), x: 12, y: 23};
    const otherStamp2 = {type: PadContentType.STAMP, stampId: stampId('id2'), x: 34, y: 45};
    const otherStamp3 = {type: PadContentType.STAMP, stampId: stampId('id3'), x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(_.state.$('contents').set()));

    const element = _.tester.createElement(TEST);
    element.config = config;
    element.state = _.state;
    element.stamp({x: 123, y: 456});

    assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
      otherStamp3,
      objectThat<StampState>().haveProperties({stampId: id, x: 123, y: 456}),
    ]));
  });
});
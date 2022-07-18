import {$stateService} from 'grapevine';
import {arrayThat, assert, run, should, test} from 'gs-testing';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, ivalue, query, registerCustomElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {componentId} from '../id/component-id';
import {stampId} from '../id/stamp-id';
import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {onTrigger} from '../trigger/trigger';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {PadContentType, padState, PadState, StampState} from './pad-state';
import {undoAction} from './undo-action';

const $test = {
  host: {
    ...create$baseComponent<PadState>().host,
    config: ivalue('config', TRIGGER_SPEC_TYPE),
    undo: icall<[], 'undo'>('undo', []),
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
            const onCall$ = this.$.host.undo;

            return merge(onTrigger$, onCall$).pipe(undoAction(this.$));
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

test('@protoboard2/src-next/pad/undo-action', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});

    const state = $stateService.get(tester.vine).addRoot<PadState>(padState(componentId('id'), {
      contents: mutableState([]),
    }))._();

    return {state, tester};
  });

  should('remove the latest entry when triggered from trigger event', () => {
    const config = {
      type: TriggerType.BACKSPACE,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: stampId('id1'), x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: stampId('id2'), x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: stampId('id3'), x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(_.state.$('contents').set()));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', TriggerElementHarness);
    harness.simulateTrigger(TriggerType.BACKSPACE);

    assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
    ]));
  });

  should('remove the latest entry when triggered from function call', () => {
    const config = {
      type: TriggerType.BACKSPACE,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: stampId('id1'), x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: stampId('id2'), x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: stampId('id3'), x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(_.state.$('contents').set()));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    element.undo();

    assert(_.state.$('contents')).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
    ]));
  });
});
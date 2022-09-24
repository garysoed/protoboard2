import {arrayThat, assert, setup, should, test} from 'gs-testing';
import {Context, DIV, icall, itarget, ivalue, query, registerCustomElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {BehaviorSubject, EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../../core/base-component';
import {TriggerElementHarness} from '../../testing/trigger-element-harness';
import {onTrigger} from '../../trigger/trigger';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../../types/trigger-spec';

import {PadContentState, PadContentType, padState, PadState, PAD_STATE_TYPE, StampState} from './pad-state';
import {undoAction} from './undo-action';

const $test = {
  host: {
    ...create$baseComponent<PadState>(PAD_STATE_TYPE).host,
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

test('@protoboard2/src/region/pad/undo-action', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [TEST]});

    const state = padState({
      contents: new BehaviorSubject<readonly PadContentState[]>([]),
    });

    return {state, tester};
  });

  should('remove the latest entry when triggered from trigger event', () => {
    const config = {
      type: TriggerType.BACKSPACE,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: 'id1', x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: 'id2', x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: 'id3', x: 56, y: 67};
    _.state.contents.next([otherStamp1, otherStamp2, otherStamp3]);

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', TriggerElementHarness);
    harness.simulateTrigger(TriggerType.BACKSPACE);

    assert(_.state.contents).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
    ]));
  });

  should('remove the latest entry when triggered from function call', () => {
    const config = {
      type: TriggerType.BACKSPACE,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: 'id1', x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: 'id2', x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: 'id3', x: 56, y: 67};
    _.state.contents.next([otherStamp1, otherStamp2, otherStamp3]);

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    element.undo();

    assert(_.state.contents).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
    ]));
  });
});
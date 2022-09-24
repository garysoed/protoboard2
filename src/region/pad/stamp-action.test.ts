import {arrayThat, assert, objectThat, run, setup, should, test} from 'gs-testing';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Context, DIV, icall, itarget, ivalue, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../../core/base-component';
import {onTrigger} from '../../trigger/trigger';
import {TriggerType} from '../../types/trigger-spec';

import {STAMP_CONFIG_TYPE} from './pad';
import {PadContentType, padState, PadState, PAD_STATE_TYPE, StampState} from './pad-state';
import {stampActionFactory, StampActionInput, STAMP_ACTION_INPUT_TYPE} from './stamp-action';


const $test = {
  host: {
    ...create$baseComponent<PadState>(PAD_STATE_TYPE).host,
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
                stampActionFactory(config, this.$.shadow.root.target)(this.$),
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
  template: `
      <style>
        #root {
          position: absolute;
          top: 10px;
          left: 30px;
        }
      </style>
      <div id="root"></div>`,
});

test('@protoboard2/src/region/pad/stamp-action', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [TEST]});

    const state = padState();

    return {state, tester};
  });

  should('add the new stamp when triggered from trigger event', () => {
    const id = 'id';
    const stampName = 'test stamp';
    const config = {
      stampId: id,
      stampName,
      type: TriggerType.CLICK,
      renderFn: () => null,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: 'id1', x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: 'id2', x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: 'id3', x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(forwardTo(_.state.contents)));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', ElementHarness);
    harness.simulateClick({clientX: 123, clientY: 456});

    assert(_.state.contents).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
      otherStamp3,
      objectThat<StampState>().haveProperties({stampId: id, x: 93, y: 446}),
    ]));
  });

  should('add the new stamp when triggered from function call', () => {
    const id = 'id';
    const stampName = 'test stamp';
    const config = {
      stampId: id,
      stampName,
      type: TriggerType.CLICK,
      renderFn: () => null,
    };

    const otherStamp1: StampState = {type: PadContentType.STAMP, stampId: 'id1', x: 12, y: 23};
    const otherStamp2: StampState = {type: PadContentType.STAMP, stampId: 'id2', x: 34, y: 45};
    const otherStamp3: StampState = {type: PadContentType.STAMP, stampId: 'id3', x: 56, y: 67};
    run(of([otherStamp1, otherStamp2, otherStamp3]).pipe(forwardTo(_.state.contents)));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    element.stamp({x: 123, y: 456});

    assert(_.state.contents).to.emitWith(arrayThat<StampState>().haveExactElements([
      otherStamp1,
      otherStamp2,
      otherStamp3,
      objectThat<StampState>().haveProperties({stampId: id, x: 93, y: 446}),
    ]));
  });
});
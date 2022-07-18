import {$stateService} from 'grapevine';
import {arrayThat, assert, objectThat, run, should, test} from 'gs-testing';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, icall, itarget, ivalue, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {componentId} from '../id/component-id';
import {lineId} from '../id/line-id';
import {onTrigger} from '../trigger/trigger';
import {TriggerType} from '../types/trigger-spec';

import {lineActionFactory, LineActionInput, LINE_ACTION_INPUT_TYPE, LINE_CONFIG_TYPE} from './line-action';
import {HalfLineState, LineState, PadContentType, padState, PadState} from './pad-state';

const $test = {
  host: {
    ...create$baseComponent<PadState>().host,
    config: ivalue('config', LINE_CONFIG_TYPE),
    line: icall<[LineActionInput], 'line'>('line', [LINE_ACTION_INPUT_TYPE]),
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
            const onCall$ = this.$.host.line;

            return merge(onTrigger$, onCall$).pipe(
                lineActionFactory(config, this.$.shadow.root.target)(this.$),
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

test('@protoboard2/src-next/pad/line-action', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});

    const state = $stateService.get(tester.vine).addRoot<PadState>(padState(componentId('id'), {
      contents: mutableState([]),
    }))._();

    return {state, tester};
  });

  should('add the new line when triggered from trigger event', () => {
    const id = lineId('id');
    const lineName = 'test line';
    const config = {
      lineId: id,
      lineName,
      type: TriggerType.CLICK,
    };

    const otherLine1: LineState = {type: PadContentType.LINE, lineId: lineId('id1'), x1: 12, y1: 23, x2: 34, y2: 45};
    const otherLine2: LineState = {type: PadContentType.LINE, lineId: lineId('id2'), x1: 56, y1: 67, x2: 78, y2: 89};
    const otherLine3: LineState = {type: PadContentType.LINE, lineId: lineId('id2'), x1: 90, y1: 1, x2: 12, y2: 23};
    run(of([otherLine1, otherLine2, otherLine3]).pipe(_.state.$('contents').set()));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', ElementHarness);

    // Add the halfline
    harness.simulateClick({clientX: 123, clientY: 456});

    assert(_.state.$('contents')).to.emitWith(arrayThat<LineState>().haveExactElements([
      otherLine1,
      otherLine2,
      otherLine3,
    ]));
    assert(_.state.$('halfLine')).to.emitWith(objectThat<HalfLineState>().haveProperties({
      x1: 93,
      y1: 446,
      lineId: id,
    }));

    // Complete the line
    harness.simulateClick({clientX: 789, clientY: 234});

    assert(_.state.$('contents')).to.emitWith(arrayThat<LineState>().haveExactElements([
      otherLine1,
      otherLine2,
      otherLine3,
      objectThat<LineState>().haveProperties({
        type: PadContentType.LINE,
        lineId: id,
        x1: 93,
        y1: 446,
        x2: 759,
        y2: 224,
      }),
    ]));
    assert(_.state.$('halfLine')).to.emitWith(null);
  });

  should('add the new stamp when triggered from function call', () => {
    const id = lineId('id');
    const lineName = 'test line';
    const config = {
      lineId: id,
      lineName,
      type: TriggerType.CLICK,
    };

    const otherLine1: LineState = {type: PadContentType.LINE, lineId: lineId('id1'), x1: 12, y1: 23, x2: 34, y2: 45};
    const otherLine2: LineState = {type: PadContentType.LINE, lineId: lineId('id2'), x1: 56, y1: 67, x2: 78, y2: 89};
    const otherLine3: LineState = {type: PadContentType.LINE, lineId: lineId('id2'), x1: 90, y1: 1, x2: 12, y2: 23};
    run(of([otherLine1, otherLine2, otherLine3]).pipe(_.state.$('contents').set()));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;

    // Add the halfline
    element.line({x: 123, y: 456});

    assert(_.state.$('contents')).to.emitWith(arrayThat<LineState>().haveExactElements([
      otherLine1,
      otherLine2,
      otherLine3,
    ]));
    assert(_.state.$('halfLine')).to.emitWith(objectThat<HalfLineState>().haveProperties({
      x1: 93,
      y1: 446,
      lineId: id,
    }));

    // Complete the line
    element.line({x: 789, y: 234});

    assert(_.state.$('contents')).to.emitWith(arrayThat<LineState>().haveExactElements([
      otherLine1,
      otherLine2,
      otherLine3,
      objectThat<LineState>().haveProperties({
        type: PadContentType.LINE,
        lineId: id,
        x1: 93,
        y1: 446,
        x2: 759,
        y2: 224,
      }),
    ]));
    assert(_.state.$('halfLine')).to.emitWith(null);
  });

  should('reset the half line if trigger with a different line ID', () => {
    const id = lineId('id');
    const otherId = lineId('other');
    const lineName = 'test line';
    const config = {
      lineId: id,
      lineName,
      type: TriggerType.CLICK,
    };

    const halfLine = {lineId: otherId, x1: 56, y1: 67};
    run(of(halfLine).pipe(_.state.$('halfLine').set()));

    const element = _.tester.bootstrapElement(TEST);
    element.config = config;
    element.state = _.state;
    const harness = getHarness(element, 'div', ElementHarness);

    // Add the halfline
    harness.simulateClick({clientX: 123, clientY: 456});

    assert(_.state.$('contents')).to.emitWith(arrayThat<LineState>().beEmpty());
    assert(_.state.$('halfLine')).to.emitWith(objectThat<HalfLineState>().haveProperties({
      x1: 93,
      y1: 446,
      lineId: id,
    }));
  });
});
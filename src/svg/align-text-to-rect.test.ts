import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {Anchor} from 'mask';
import {Context, Ctrl, itarget, ivalue, query, RECT, registerCustomElement, TEXT} from 'persona';
import {setupTest} from 'persona/export/testing';
import {merge, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {alignTextToRect, ALIGN_SPEC_TYPE} from './align-text-to-rect';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    anchorSpec: ivalue('anchorSpec', ALIGN_SPEC_TYPE),
  },
  shadow: {
    rect: query('rect', RECT, {
      target: itarget(),
    }),
    text: query('text', TEXT, {
      target: itarget(),
    }),
  },
};
class Test implements Ctrl {
  constructor(private $: Context<typeof $test>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.host.anchorSpec.pipe(
          filterNonNullable(),
          switchMap(anchorSpec => {
            return merge(
                ...alignTextToRect({
                  anchorSpec,
                  rect$: this.$.shadow.rect.target,
                  text$: this.$.shadow.text.target,
                }),
            );
          }),
      ),
    ];
  }
}
const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: `
      <svg>
        <rect
            fill="red"
            x="20"
            y="40"
            width="60"
            height="80">
        </rect>
        <text>dop</text>
      </svg>`,
});

test('@protoboard2/src/svg/align-text-to-rect', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/svg/goldens', goldens));

    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('align correctly when horizontal content and target anchors are (START, START)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.START},
      text: {horizontal: Anchor.START, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__horizontal-start-start.html');
  });

  should('align correctly when horizontal content and target anchors are (MIDDLE, MIDDLE)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.MIDDLE, vertical: Anchor.START},
      text: {horizontal: Anchor.MIDDLE, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__horizontal-middle-middle.html');
  });

  should('align correctly when horizontal content and target anchors are (END, END)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.END, vertical: Anchor.START},
      text: {horizontal: Anchor.END, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__horizontal-end-end.html');
  });

  should('align correctly when vertical content and target anchors are (START, START)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.START},
      text: {horizontal: Anchor.START, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__vertical-start-start.html');
  });

  should('align correctly when vertical content and target anchors are (MIDDLE, MIDDLE)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.MIDDLE},
      text: {horizontal: Anchor.START, vertical: Anchor.MIDDLE},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__vertical-middle-middle.html');
  });

  should('align correctly when vertical content and target anchors are (END, END)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.END},
      text: {horizontal: Anchor.START, vertical: Anchor.END},
    };

    assert(element).to.matchSnapshot('align-text-to-rect__vertical-end-end.html');
  });
});

import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {Anchor} from 'mask';
import {Context, Ctrl, itarget, ivalue, query, RECT, registerCustomElement, TEXT} from 'persona';
import {setupTest} from 'persona/export/testing';
import {merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import goldens from './goldens/goldens.json';
import {renderSvgText, ALIGN_SPEC_TYPE} from './render-svg-text';


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
                ...renderSvgText({
                  anchorSpec,
                  context: {document: this.$.element.ownerDocument, vine: this.$.vine},
                  rect$: this.$.shadow.rect.target,
                  text$: this.$.shadow.text.target,
                  content$: of('dop'),
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
        <text></text>
      </svg>`,
});

test('@protoboard2/src/svg/render-svg-text', () => {
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

    assert(element).to.matchSnapshot('render-svg-text__horizontal-start-start.html');
  });

  should('align correctly when horizontal content and target anchors are (MIDDLE, MIDDLE)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.MIDDLE, vertical: Anchor.START},
      text: {horizontal: Anchor.MIDDLE, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('render-svg-text__horizontal-middle-middle.html');
  });

  should('align correctly when horizontal content and target anchors are (END, END)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.END, vertical: Anchor.START},
      text: {horizontal: Anchor.END, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('render-svg-text__horizontal-end-end.html');
  });

  should('align correctly when vertical content and target anchors are (START, START)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.START},
      text: {horizontal: Anchor.START, vertical: Anchor.START},
    };

    assert(element).to.matchSnapshot('render-svg-text__vertical-start-start.html');
  });

  should('align correctly when vertical content and target anchors are (MIDDLE, MIDDLE)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.MIDDLE},
      text: {horizontal: Anchor.START, vertical: Anchor.MIDDLE},
    };

    assert(element).to.matchSnapshot('render-svg-text__vertical-middle-middle.html');
  });

  should('align correctly when vertical content and target anchors are (END, END)', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.anchorSpec = {
      rect: {horizontal: Anchor.START, vertical: Anchor.END},
      text: {horizontal: Anchor.START, vertical: Anchor.END},
    };

    assert(element).to.matchSnapshot('render-svg-text__vertical-end-end.html');
  });
});

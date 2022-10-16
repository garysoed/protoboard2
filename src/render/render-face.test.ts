import {source} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, ocase, query, registerCustomElement} from 'persona';
import {getHarness, setupTest} from 'persona/export/testing';
import {Observable, of, ReplaySubject} from 'rxjs';

import {LENS} from '../face/lens';
import {LENS_DISPLAY} from '../face/lens-display';
import {LensHarness} from '../face/testing/lens-harness';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {FaceSpec} from '../types/is-multifaced';

import goldens from './goldens/goldens.json';
import {renderFace} from './render-face';

const $spec = source(() => new ReplaySubject<FaceSpec>(1));

const $test = {
  shadow: {
    root: query('div', DIV, {
      content: ocase<FaceSpec>(),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.root.content(renderFace())),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [],
  spec: $test,
  tag: 'pbt-test',
  template: '<div></div>',
});

test('@protoboard2/src/render/render-face', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({
      roots: [LENS, LENS_DISPLAY, TEST, TEST_FACE],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    return {tester};
  });

  should('render the faces correctly', () => {
    $spec.get(_.tester.vine).next({
      renderSpec$: of(renderTestFace('crimson')),
      renderLensSpec$: of(renderTestFace('chartreuse')),
    });
    const element = _.tester.bootstrapElement(TEST);

    assert(element).to.matchSnapshot('render-face__target.html');

    const lensDisplay = _.tester.bootstrapElement(LENS_DISPLAY);
    getHarness(element, LENS.tag, LensHarness).simulateHover();

    assert(lensDisplay).to.matchSnapshot('render-face__lens-display.html');
  });
});
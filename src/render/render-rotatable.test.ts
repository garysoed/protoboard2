import {source} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, ostyle, query, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable} from 'rxjs';

import {TEST_FACE} from '../testing/test-face';

import goldens from './goldens/goldens.json';
import {renderRotatable} from './render-rotatable';


const $state = source(() => ({
  id: {},
  rotationDeg: new BehaviorSubject<number>(0),
}));

const $test = {
  shadow: {
    container: query('#container', DIV, {
      transform: ostyle('transform'),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $state.get(this.$.vine).rotationDeg.pipe(
          renderRotatable(),
          this.$.shadow.container.transform(),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  deps: [TEST_FACE],
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container" style="position: absolute"><pbt-face></pbt-face></div>',
});

test('@protoboard2/src/render/render-rotatable', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('output the correct transform style', () => {
    const rotationDeg = 123;
    $state.get(_.tester.vine).rotationDeg.next(rotationDeg);

    const element = _.tester.bootstrapElement(TEST);

    assert(element).to.matchSnapshot('render-rotatable.html');
  });
});

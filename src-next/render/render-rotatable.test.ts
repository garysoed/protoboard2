import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, Ctrl, DIV, query, ostyle, registerCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import {TEST_FACE} from '../testing/test-face';

import goldens from './goldens/goldens.json';
import {renderRotatable} from './render-rotatable';


const $state = source(vine => $stateService.get(vine).addRoot({
  id: {},
  rotationDeg: mutableState<number>(0),
})._());

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
      $state.get(this.$.vine).$('rotationDeg').pipe(
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

test('@protoboard2/src/render/render-rotatable', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('output the correct transform style', () => {
    const rotationDeg = 123;
    of(rotationDeg).pipe($state.get(_.tester.vine).$('rotationDeg').set()).subscribe();

    const element = _.tester.bootstrapElement(TEST);

    assert(element).to.matchSnapshot('render-rotatable.html');
  });
});

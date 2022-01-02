import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, id, omulti, registerCustomElement, RenderSpec, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {of, OperatorFunction} from 'rxjs';

import {$getRenderSpec$} from '../render/render-component-spec';
import {RegionState} from '../types/region-state';

import {create$baseComponent} from './base-component';
import {BaseRegion} from './base-region';
import goldens from './goldens/goldens.json';


interface TestState extends RegionState { }

const $test = {
  host: {
    ...create$baseComponent<TestState>().host,
  },
  shadow: {
    container: id('container', DIV, {
      content: omulti('#ref'),
    }),
  },
};

class Test extends BaseRegion<TestState> {
  constructor(private readonly $: Context<typeof $test>) {
    super($);
  }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return this.$.shadow.container.content();
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container"><!-- #ref --></div>',
});

test('@protoboard2/src/core/render-contents', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/core/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      $getRenderSpec$.get(_.tester.vine).next(id => {
        return renderTextNode({
          textContent: id as string,
          id,
        });
      });

      const stateService = $stateService.get(_.tester.vine);
      const $state = stateService.addRoot(mutableState<TestState>({
        id: 'test',
        contentIds: mutableState([]),
      }));
      const state$ = stateService.$($state);
      const element = _.tester.createElement(TEST);
      element.state = state$;

      of(['one', 'two', 'three']).pipe(state$.$('contentIds').set()).subscribe();

      assert(element).to.matchSnapshot('base-region.html');
    });
  });
});

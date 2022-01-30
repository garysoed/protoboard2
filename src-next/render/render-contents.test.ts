import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, Ctrl, DIV, id, omulti, registerCustomElement, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import goldens from './goldens/goldens.json';
import {$getComponentRenderSpec$} from './render-component-spec';
import {renderContents} from './render-contents';


const $state = source(vine => $stateService.get(vine).addRoot({
  id: {},
  contentIds: mutableState<readonly string[]>([]),
})._());

const $test = {
  shadow: {
    container: id('container', DIV, {
      content: omulti('#ref'),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $state.get(this.$.vine).$('contentIds').pipe(
          renderContents(this.$.vine),
          this.$.shadow.container.content(),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="container"><!-- #ref --></div>',
});

test('@protoboard2/src/render/render-contents', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      $getComponentRenderSpec$.get(_.tester.vine).next(id => {
        return renderTextNode({
          textContent: of(id as string),
          id,
        });
      });

      const element = _.tester.createElement(TEST);

      of(['one', 'two', 'three']).pipe(
          $state.get(_.tester.vine).$('contentIds').set(),
      ).subscribe();

      assert(element).to.matchSnapshot('render-contents.html');
    });
  });
});

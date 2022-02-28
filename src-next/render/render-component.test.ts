import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {Context, Ctrl, DIV, id, oforeach, registerCustomElement, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import {registerComponentRenderSpec} from '../renderspec/render-component-spec';

import goldens from './goldens/goldens.json';
import {renderComponent} from './render-component';


const $state = source(vine => $stateService.get(vine).addRoot({
  id: {},
  contentIds: mutableState<readonly string[]>([]),
})._());

const $test = {
  shadow: {
    container: id('container', DIV, {
      content: oforeach('#ref', instanceofType(Object)),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $state.get(this.$.vine).$('contentIds').pipe(
          this.$.shadow.container.content(id => renderComponent(this.$.vine, id)),
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

test('@protoboard2/src/render/render-component', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(id as string),
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

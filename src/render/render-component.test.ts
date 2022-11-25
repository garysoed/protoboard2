import {source} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, oforeach, query, registerCustomElement, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {ComponentId, componentId} from '../id/component-id';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';

import goldens from './goldens/goldens.json';
import {renderComponent} from './render-component';


const $state = source(() => ({
  id: componentId('test'),
  contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
}));

const $test = {
  shadow: {
    container: query('#container', DIV, {
      content: oforeach<ComponentId>('#ref'),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderComponent(
          this.$.vine,
          $state.get(this.$.vine).contentIds,
          fn => this.$.shadow.container.content(map(id => fn(id))),
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

test('@protoboard2/src/render/render-component', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  test('contents$', () => {
    should('render the contents correctly', () => {
      const contentIds = ['test', 'test', 'test'].map(componentId);
      const idsMap = new Map([
        [contentIds[0], 'one'],
        [contentIds[1], 'two'],
        [contentIds[2], 'three'],
      ]);
      registerComponentRenderSpec(_.tester.vine, id => {
        return renderTextNode({
          textContent: of(idsMap.get(id) ?? ''),
        });
      });

      const element = _.tester.bootstrapElement(TEST);

      $state.get(_.tester.vine).contentIds.next(contentIds);

      assert(element).to.matchSnapshot('render-contents.html');
    });
  });
});

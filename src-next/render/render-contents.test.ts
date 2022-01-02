import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, Ctrl, DIV, id, omulti, registerCustomElement, renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, of} from 'rxjs';

import goldens from './goldens/goldens.json';
import {$getRenderSpec$} from './render-component-spec';
import {renderContents} from './render-contents';


const $stateId = source(vine => $stateService.get(vine).addRoot({
  id: {},
  contentIds: mutableState<readonly string[]>([]),
}));

const $state = source(vine => $stateService.get(vine)._($stateId.get(vine)));

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
      renderContents(
          $stateService.get(this.$.vine)._($stateId.get(this.$.vine)),
          this.$.vine,
      )
          .pipe(
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
      $getRenderSpec$.get(_.tester.vine).next(id => {
        return renderTextNode({
          textContent: id as string,
          id,
        });
      });

      const element = _.tester.createElement(TEST);

      of(['one', 'two', 'three']).pipe(
          $state.get(_.tester.vine).$('contentIds').set(),
      ) .subscribe();

      assert(element).to.matchSnapshot('render-content.html');
    });
  });
});

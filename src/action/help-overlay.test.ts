import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {_p} from 'mask';
import {createFakeContext, PersonaTesterFactory} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {TriggerType} from '../core/trigger-spec';

import render from './goldens/help-overlay__render.html';
import renderEmpty from './goldens/help-overlay__render_empty.html';
import {$, HelpOverlay} from './help-overlay';
import {$helpService} from './help-service';
import {PickAction} from './pick-action';
import {createFakeActionContext} from './testing/fake-action-context';


const testerFactory = new PersonaTesterFactory(_p);

test('@protoboard2/action/help-overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({render, renderEmpty}));

    const tester = testerFactory.build({rootCtrls: [HelpOverlay], rootDoc: document});
    const el = tester.createElement(HelpOverlay);

    const targetEl = document.createElement('div');
    const shadowRoot = targetEl.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot, vine: tester.vine});
    const testAction = new PickAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(null),
        }),
    );
    return {el, testAction, tester};
  });

  test('renderIsVisible', () => {
    should('not add the isVisible class if there are no actions in the help service', () => {
      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(false);
    });

    should('add the isVisible class if there is an action in the help service', () => {
      $helpService.get(_.tester.vine).show(new Map([[TriggerType.CLICK, _.testAction]]));

      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(true);
    });
  });

  test('tableRows$', () => {
    should('render rows correctly', () => {
      $helpService.get(_.tester.vine).show(new Map([
        [{type: TriggerType.CLICK, meta: true, alt: true}, _.testAction],
      ]));

      assert(_.el.flattenContent()).to.matchSnapshot('render');
    });

    should('render deletion correctly', () => {
      const service = $helpService.get(_.tester.vine);
      service.show(new Map([[TriggerType.CLICK, _.testAction]]));
      service.show(new Map());

      assert(_.el.flattenContent()).to.matchSnapshot('renderEmpty');
    });
  });

  test('setupHandleClick', () => {
    should('hide the help when clicked', () => {
      $helpService.get(_.tester.vine).show(new Map([[TriggerType.CLICK, _.testAction]]));

      _.el.dispatchEvent($.root._.click);

      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(false);

      const actionsLength$ = $helpService.get(_.tester.vine).actions$.pipe(
          map(actions => actions.length),
      );
      assert(actionsLength$).to.emitWith(0);
    });
  });
});

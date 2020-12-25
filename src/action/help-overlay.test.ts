import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {_p} from 'mask';
import {PersonaTesterFactory, createFakeContext} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';

import {TriggerType} from '../core/trigger-spec';

import {$, $helpOverlay, HelpOverlay} from './help-overlay';
import {$helpService} from './help-service';
import {PickAction} from './pick-action';
import * as snapshots from './snapshots.json';
import {createFakeActionContext} from './testing/fake-action-context';


const testerFactory = new PersonaTesterFactory(_p);

test('@protoboard2/action/help-overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv(snapshots));

    const tester = testerFactory.build([HelpOverlay], document);
    const el = tester.createElement($helpOverlay.tag);

    const targetEl = document.createElement('div');
    const shadowRoot = targetEl.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot, vine: tester.vine});
    const testAction = new PickAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(null),
        }),
        {},
    );
    return {el, testAction, tester};
  });

  test('renderIsVisible', () => {
    should('not add the isVisible class if there are no actions in the help service', () => {
      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(false);
    });

    should('add the isVisible class if there is an action in the help service', () => {
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerType.CLICK, _.testAction]]));
          }),
      ));

      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(true);
    });
  });

  test('tableRows$', () => {
    should('render rows correctly', () => {
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([
              [{type: TriggerType.CLICK, meta: true, alt: true}, _.testAction],
            ]));
          }),
      ));

      assert(_.el.element.shadowRoot!.getElementById('content')!.innerHTML)
          .to.matchSnapshot('helpOverlay.render');
    });

    should('render deletion correctly', () => {
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerType.CLICK, _.testAction]]));
            service.show(new Map());
          }),
      ));

      assert(_.el.element.shadowRoot!.getElementById('content')!.innerHTML)
          .to.matchSnapshot('helpOverlay.renderEmpty');
    });
  });

  test('setupHandleClick', () => {
    should('hide the help when clicked', () => {
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerType.CLICK, _.testAction]]));
          }),
      ));

      _.el.dispatchEvent($.root._.click);

      assert(_.el.hasClass($.root._.isVisibleClass)).to.equal(false);

      const actionsLength$ = $helpService.get(_.tester.vine)
          .pipe(
              switchMap(service => service.actions$),
              map(actions => actions.length),
          );
      assert(actionsLength$).to.emitWith(0);
    });
  });
});

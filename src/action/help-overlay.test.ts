import { assert, should, test } from 'gs-testing';
import { scanArray } from 'gs-tools/export/rxjs';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map, switchMap, take } from 'rxjs/operators';

import { $, HelpOverlay } from './help-overlay';
import { $helpService } from './help-service';
import { PickAction } from './pick-action';


const testerFactory = new PersonaTesterFactory(_p);

function createShadowRoot(): ShadowRoot {
  const element = document.createElement('div');
  return element.attachShadow({mode: 'open'});
}

test('@protoboard2/action/help-overlay', init => {
  const _ = init(() => {
    const tester = testerFactory.build([HelpOverlay])
        .createElement('pb-help-overlay', document.body);
    return {tester};
  });

  test('renderIsVisible', () => {
    should(`not add the isVisible class if there are no actions in the help service`, () => {
      assert(_.tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([false]);
    });

    should(`add the isVisible class if there is an action in the help service`, () => {
      $helpService.get(_.tester.vine).pipe(take(1)).subscribe(service => {
        service.show([new PickAction({shadowRoot: createShadowRoot(), vine: _.tester.vine})]);
      });

      assert(_.tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([true]);
    });
  });

  test('renderRows', () => {
    should(`render rows correctly`, () => {
      const action = new PickAction({shadowRoot: createShadowRoot(), vine: _.tester.vine});
      $helpService.get(_.tester.vine).pipe(take(1)).subscribe(service => {
        service.show([action]);
      });

      const nodes$ = _.tester.getNodesAfter($.content._.rows);
      const triggers$ = nodes$.pipe(
          map(nodes => {
            return (nodes[0] as HTMLElement).querySelector('#trigger')!.innerHTML;
          }),
      );
      const actions$ = nodes$.pipe(
          map(nodes => {
            return (nodes[0] as HTMLElement).querySelector('#action')!.innerHTML;
          }),
      );

      assert(triggers$).to.emitWith('click');
      assert(actions$).to.emitWith(action.actionName);
    });

    should(`render deletion correctly`, () => {
      const action = new PickAction({shadowRoot: createShadowRoot(), vine: _.tester.vine});
      $helpService.get(_.tester.vine).pipe(take(1)).subscribe(service => {
        service.show([action]);
        service.show([]);
      });

      const nodes$ = _.tester.getNodesAfter($.content._.rows)
          .pipe(map(nodes => nodes.filter(node => node instanceof HTMLElement).length));
      assert(nodes$).to.emitWith(0);
    });
  });

  test('setupHandleClick', () => {
    should(`hide the help when clicked`, () => {
      $helpService.get(_.tester.vine).pipe(take(1)).subscribe(service => {
        service.show([new PickAction({shadowRoot: createShadowRoot(), vine: _.tester.vine})]);
      });

      _.tester.dispatchEvent($.root._.click).subscribe();

      assert(_.tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([false]);

      const actionsLength$ = $helpService.get(_.tester.vine)
          .pipe(
              switchMap(service => service.actions$),
              scanArray(),
              map(actions => actions.length),
          );
      assert(actionsLength$).to.emitWith(0);
    });
  });
});

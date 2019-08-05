import { assert, setup, should, test } from '@gs-testing';
import { scanArray } from '@gs-tools/rxjs';
import { _p } from '@mask';
import { ElementTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, take } from '@rxjs/operators';

import { $, HelpOverlay } from './help-overlay';
import { $helpService } from './help-service';
import { PickAction } from './pick-action';

const testerFactory = new PersonaTesterFactory(_p);

test('@protoboard2/action/help-overlay', () => {
  let tester: ElementTester;

  setup(() => {
    tester = testerFactory.build([HelpOverlay]).createElement('pb-help-overlay', document.body);
  });

  test('renderIsVisible', () => {
    should(`not add the isVisible class if there are no actions in the help service`, () => {
      assert(tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([false]);
    });

    should(`add the isVisible class if there is an action in the help service`, () => {
      $helpService.get(tester.vine).pipe(take(1)).subscribe(service => {
        service.show([new PickAction()]);
      });

      assert(tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([true]);
    });
  });

  test('renderRows', () => {
    should(`render rows correctly`, () => {
      const action = new PickAction();
      $helpService.get(tester.vine).pipe(take(1)).subscribe(service => {
        service.show([action]);
      });

      const nodes$ = tester.getNodesAfter($.content._.rows);
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
      const action = new PickAction();
      $helpService.get(tester.vine).pipe(take(1)).subscribe(service => {
        service.show([action]);
        service.show([]);
      });

      const nodes$ = tester.getNodesAfter($.content._.rows)
          .pipe(map(nodes => nodes.filter(node => node instanceof HTMLElement).length));
      assert(nodes$).to.emitWith(0);
    });
  });

  test('setupHandleClick', () => {
    should(`hide the help when clicked`, () => {
      $helpService.get(tester.vine).pipe(take(1)).subscribe(service => {
        service.show([new PickAction()]);
      });

      tester.dispatchEvent($.root._.click).subscribe();

      assert(tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([false]);

      const actionsLength$ = $helpService.get(tester.vine)
          .pipe(
              switchMap(service => service.actions$),
              scanArray(),
              map(actions => actions.length),
          );
      assert(actionsLength$).to.emitWith(0);
    });
  });
});

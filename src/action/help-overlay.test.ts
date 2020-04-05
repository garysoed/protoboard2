import { assert, run, should, test } from 'gs-testing';
import { scanArray } from 'gs-tools/export/rxjs';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { TriggerSpec } from '../core/trigger-spec';

import { $, HelpOverlay } from './help-overlay';
import { $helpService } from './help-service';
import { PickAction } from './pick-action';


const testerFactory = new PersonaTesterFactory(_p);

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
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerSpec.CLICK, new PickAction(_.tester.vine)]]));
          }),
      ));

      assert(_.tester.getHasClass($.root._.isVisibleClass)).to.emitSequence([true]);
    });
  });

  test('renderRows', () => {
    should(`render rows correctly`, () => {
      const action = new PickAction(_.tester.vine);
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerSpec.CLICK, action]]));
          }),
      ));

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
      const action = new PickAction(_.tester.vine);
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerSpec.CLICK, action]]));
            service.show(new Map());
          }),
      ));

      const nodes$ = _.tester.getNodesAfter($.content._.rows)
          .pipe(map(nodes => nodes.filter(node => node instanceof HTMLElement).length));
      assert(nodes$).to.emitWith(0);
    });
  });

  test('setupHandleClick', () => {
    should(`hide the help when clicked`, () => {
      run($helpService.get(_.tester.vine).pipe(
          take(1),
          tap(service => {
            service.show(new Map([[TriggerSpec.CLICK, new PickAction(_.tester.vine)]]));
          }),
      ));

      run(_.tester.dispatchEvent($.root._.click));

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

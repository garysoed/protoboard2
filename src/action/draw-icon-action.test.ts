import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, Subject} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {CanvasEntry, CanvasIcon} from '../face/canvas-entry';

import {drawIconAction} from './draw-icon-action';


test('@protoboard2/src/action/draw-icon-action', init => {
  const CONFIG_NAME = 'CONFIG_NAME';
  const _ = init(() => {
    const stateService = fakeStateService();

    const iconsId: StateId<readonly CanvasIcon[]> = stateService.modify(x => x.add([]));
    const objectId: StateId<CanvasEntry> = stateService.modify(x => x.add({
      icons: iconsId,
      lines: x.add([]),
      halfLine: x.add(null),
    }));

    const action = drawIconAction({
      config$: of({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        configName: CONFIG_NAME,
        trigger: {type: TriggerType.CLICK},
      }),
      objectId$: of(objectId),
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));
    return {action, iconsId, onTrigger$, stateService};
  });

  should('add the icon to the state if one does not exist', () => {
    _.stateService.modify(x => x.set(_.iconsId, []));

    const icons$ = createSpySubject(_.stateService.resolve(_.iconsId));

    _.onTrigger$.next({mouseX: 0, mouseY: 0});

    assert(icons$).to.emitSequence([
      arrayThat<CanvasIcon>().haveExactElements([]),
      arrayThat<CanvasIcon>().haveExactElements([
        objectThat<CanvasIcon>().haveProperties({
          x: 10,
          y: 20,
          width: 30,
          height: 40,
          configName: CONFIG_NAME,
        }),
      ]),
    ]);
  });

  should('remove the icon from the state if a matching one exists', () => {
    _.stateService.modify(x => {
      x.set(_.iconsId, [{
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        configName: CONFIG_NAME,
      }]);
    });

    const icons$ = createSpySubject(_.stateService.resolve(_.iconsId));

    _.onTrigger$.next({mouseX: 0, mouseY: 0});

    assert(icons$).to.emitSequence([
      arrayThat<CanvasIcon>().haveExactElements([
        objectThat<CanvasIcon>().haveProperties({
          x: 10,
          y: 20,
          width: 30,
          height: 40,
          configName: CONFIG_NAME,
        }),
      ]),
      arrayThat<CanvasIcon>().haveExactElements([]),
    ]);
  });
});
import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {of, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {CanvasIcon, CanvasSpec} from '../face/canvas-entry';

import {drawIconAction} from './draw-icon-action';


test('@protoboard2/src/action/draw-icon-action', init => {
  const CONFIG_NAME = 'CONFIG_NAME';
  const _ = init(() => {
    const stateService = fakeStateService();

    const objectId = stateService.addRoot<CanvasSpec>({
      icons: mutableState([]),
      lines: mutableState([]),
      halfLine: mutableState(null),
    });
    const objectPath = stateService.immutablePath(objectId);

    const action = drawIconAction({
      config$: of({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        configName: CONFIG_NAME,
        trigger: {type: TriggerType.CLICK},
      }),
      objectPath$: of(objectPath),
      vine: new Vine({
        appName: 'test',
        overrides: [
          {override: $stateService, withValue: stateService},
        ],
      }),
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));
    return {action, objectPath, onTrigger$, stateService};
  });

  should('add the icon to the state if one does not exist', () => {
    run(of([]).pipe(_.stateService._(_.objectPath).$('icons').set()));

    const icons$ = createSpySubject(_.stateService._(_.objectPath).$('icons'));

    _.onTrigger$.next(fakeTriggerEvent({}));

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
    const state = {
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      configName: CONFIG_NAME,
    };
    run(of([state]).pipe(_.stateService._(_.objectPath).$('icons').set()));

    const icons$ = createSpySubject(_.stateService._(_.objectPath).$('icons'));

    _.onTrigger$.next(fakeTriggerEvent({}));

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
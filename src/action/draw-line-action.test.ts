import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {of, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {CanvasHalfLine, CanvasLine} from '../face/canvas-entry';

import {drawLineAction} from './draw-line-action';


test('@protoboard2/src/action/draw-line-action', init => {
  const CONFIG_NAME = 'CONFIG_NAME';
  const _ = init(() => {
    const stateService = fakeStateService();

    const objectId = stateService.addRoot({
      icons: mutableState([]),
      lines: mutableState<readonly CanvasLine[]>([]),
      halfLine: mutableState<CanvasHalfLine|null>(null),
    });
    const objectPath = stateService.immutablePath(objectId);

    const action = drawLineAction({
      config$: of({
        x: 10,
        y: 20,
        configName: CONFIG_NAME,
        trigger: {type: TriggerType.A},
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

  should('add the linehalf if one does not exist', () => {
    run(of(null).pipe(_.stateService._(_.objectPath).$('halfLine').set()));

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      null,
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: 10,
        fromY: 20,
        configName: CONFIG_NAME,
      }),
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([]),
    ]);
  });

  should('add the line if there is a linehalf', () => {
    run(
        of({fromX: -10, fromY: -20, configName: CONFIG_NAME})
            .pipe(_.stateService._(_.objectPath).$('halfLine').set()),
    );

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: -10,
        fromY: -20,
        configName: CONFIG_NAME,
      }),
      null,
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([]),
      arrayThat<CanvasLine>().haveExactElements([
        objectThat<CanvasLine>().haveProperties({
          fromX: -10,
          fromY: -20,
          toX: 10,
          toY: 20,
          configName: CONFIG_NAME,
        }),
      ]),
    ]);
  });

  should('cancel making the line if the start and end are the same', () => {
    run(
        of({fromX: 10, fromY: 20, configName: CONFIG_NAME})
            .pipe(_.stateService._(_.objectPath).$('halfLine').set()),
    );

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: 10,
        fromY: 20,
        configName: CONFIG_NAME,
      }),
      null,
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([]),
    ]);
  });

  should('cancel if the start and end config names are different', () => {
    run(
        of({fromX: -10, fromY: -20, configName: 'otherConfig'})
            .pipe(_.stateService._(_.objectPath).$('halfLine').set()),
    );

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: -10,
        fromY: -20,
        configName: 'otherConfig',
      }),
      null,
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([]),
    ]);
  });

  should('remove the line if the start and end already exist and not swapped', () => {
    run(
        of([{fromX: -10, fromY: -20, toX: 10, toY: 20, configName: CONFIG_NAME}])
            .pipe(_.stateService._(_.objectPath).$('lines').set()),
    );
    run(
        of({fromX: -10, fromY: -20, configName: CONFIG_NAME})
            .pipe(_.stateService._(_.objectPath).$('halfLine').set()),
    );

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: -10,
        fromY: -20,
        configName: CONFIG_NAME,
      }),
      null,
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([
        objectThat<CanvasLine>().haveProperties({
          fromX: -10,
          fromY: -20,
          toX: 10,
          toY: 20,
          configName: CONFIG_NAME,
        }),
      ]),
      arrayThat<CanvasLine>().haveExactElements([]),
    ]);
  });

  should('remove the line if the start and end already exist and swapped', () => {
    run(
        of([{fromX: 10, fromY: 20, toX: -10, toY: -20, configName: CONFIG_NAME}])
            .pipe(_.stateService._(_.objectPath).$('lines').set()),
    );
    run(
        of({fromX: -10, fromY: -20, configName: CONFIG_NAME})
            .pipe(_.stateService._(_.objectPath).$('halfLine').set()),
    );

    const halfLine$ = createSpySubject(_.stateService._(_.objectPath).$('halfLine'));
    const lines$ = createSpySubject(_.stateService._(_.objectPath).$('lines'));

    _.onTrigger$.next(fakeTriggerEvent({}));

    assert(halfLine$).to.emitSequence([
      objectThat<CanvasHalfLine>().haveProperties({
        fromX: -10,
        fromY: -20,
        configName: CONFIG_NAME,
      }),
      null,
    ]);

    assert(lines$).to.emitSequence([
      arrayThat<CanvasLine>().haveExactElements([
        objectThat<CanvasLine>().haveProperties({
          fromX: 10,
          fromY: 20,
          toX: -10,
          toY: -20,
          configName: CONFIG_NAME,
        }),
      ]),
      arrayThat<CanvasLine>().haveExactElements([]),
    ]);
  });
});
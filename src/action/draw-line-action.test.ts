import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of, Subject} from 'rxjs';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';
import {CanvasEntry, CanvasHalfLine, CanvasLine} from '../face/canvas-entry';

import {drawLineAction} from './draw-line-action';


test('@protoboard2/src/action/draw-line-action', init => {
  const CONFIG_NAME = 'CONFIG_NAME';
  const _ = init(() => {
    const stateService = fakeStateService();

    const halfLineId: StateId<CanvasHalfLine|null> = stateService.modify(x => x.add(null));
    const linesId: StateId<readonly CanvasLine[]> = stateService.modify(x => x.add([]));
    const objectId: StateId<CanvasEntry> = stateService.modify(x => x.add({
      icons: x.add([]),
      lines: linesId,
      halfLine: halfLineId,
    }));

    const action = drawLineAction({
      config$: of({
        x: 10,
        y: 20,
        configName: CONFIG_NAME,
        trigger: {type: TriggerType.A},
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

    return {action, halfLineId, linesId, onTrigger$, stateService};
  });

  should('add the linehalf if one does not exist', () => {
    _.stateService.modify(x => x.set(_.halfLineId, null));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
    _.stateService.modify(x => x.set(
        _.halfLineId,
        {fromX: -10, fromY: -20, configName: CONFIG_NAME},
    ));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
    _.stateService.modify(x => x.set(
        _.halfLineId,
        {fromX: 10, fromY: 20, configName: CONFIG_NAME},
    ));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
    _.stateService.modify(x => x.set(
        _.halfLineId,
        {fromX: -10, fromY: -20, configName: 'otherConfig'},
    ));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
    _.stateService.modify(x => x.set(
        _.linesId,
        [{fromX: -10, fromY: -20, toX: 10, toY: 20, configName: CONFIG_NAME}],
    ));
    _.stateService.modify(x => x.set(
        _.halfLineId,
        {fromX: -10, fromY: -20, configName: CONFIG_NAME},
    ));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
    _.stateService.modify(x => x.set(
        _.linesId,
        [{fromX: 10, fromY: 20, toX: -10, toY: -20, configName: CONFIG_NAME}],
    ));
    _.stateService.modify(x => x.set(
        _.halfLineId,
        {fromX: -10, fromY: -20, configName: CONFIG_NAME},
    ));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

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
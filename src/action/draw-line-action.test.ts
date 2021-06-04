import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {constantIn, host} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {CanvasEntry, CanvasHalfLine, CanvasLine} from '../face/canvas-entry';

import {drawLineAction} from './draw-line-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';


test('@protoboard2/src/action/draw-line-action', init => {
  const CONFIG_NAME = 'CONFIG_NAME';
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const halfLineId: StateId<CanvasHalfLine|null> = stateService.modify(x => x.add(null));
    const linesId: StateId<readonly CanvasLine[]> = stateService.modify(x => x.add([]));
    const objectId: StateId<CanvasEntry> = stateService.modify(x => x.add({
      icons: x.add([]),
      lines: linesId,
      halfLine: halfLineId,
    }));
    const context = createFakeActionContext<CanvasEntry>({
      objectId$: of(objectId),
      personaContext,
    });

    const action1 = drawLineAction(
        host({
          x: constantIn(of(10)),
          y: constantIn(of(20)),
          configName: constantIn(of(CONFIG_NAME)),
          trigger: constantIn(of({type: TriggerType.A})),
        })._,
        'testAction',
    ).action;

    const action2 = drawLineAction(
        host({
          x: constantIn(of(30)),
          y: constantIn(of(40)),
          configName: constantIn(of(CONFIG_NAME)),
          trigger: constantIn(of({type: TriggerType.B})),
        })._,
        'testAction',
    ).action;

    const action3 = drawLineAction(
        host({
          x: constantIn(of(50)),
          y: constantIn(of(60)),
          configName: constantIn(of('otherConfig')),
          trigger: constantIn(of({type: TriggerType.C})),
        })._,
        'testAction',
    ).action;
    return {action1, action2, action3, context, el, halfLineId, linesId, stateService};
  });

  should('add the linehalf if one does not exist', () => {
    _.stateService.modify(x => x.set(_.halfLineId, null));

    const halfLine$ = createSpySubject(_.stateService.resolve(_.halfLineId));
    const lines$ = createSpySubject(_.stateService.resolve(_.linesId));

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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

    run(_.action1(_.context));
    triggerKey(_.el, {key: TriggerType.A});

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
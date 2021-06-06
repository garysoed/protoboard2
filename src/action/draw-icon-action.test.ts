import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {CanvasEntry, CanvasIcon} from '../face/canvas-entry';

import {drawIconAction} from './draw-icon-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerClick} from './testing/trigger-click';


test('@protoboard2/src/action/draw-icon-action', init => {
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

    const iconsId: StateId<readonly CanvasIcon[]> = stateService.modify(x => x.add([]));
    const objectId: StateId<CanvasEntry> = stateService.modify(x => x.add({
      icons: iconsId,
      lines: x.add([]),
      halfLine: x.add(null),
    }));
    const context = createFakeActionContext<CanvasEntry>({
      objectId$: of(objectId),
      personaContext,
    });

    const action = drawIconAction(
        of({
          x: 10,
          y: 20,
          configName: CONFIG_NAME,
          trigger: {type: TriggerType.CLICK},
        }),
        'testAction',
    ).action;
    return {action, context, el, iconsId, stateService};
  });

  should('add the icon to the state if one does not exist', () => {
    _.stateService.modify(x => x.set(_.iconsId, []));

    const icons$ = createSpySubject(_.stateService.resolve(_.iconsId));

    run(_.action(_.context));
    triggerClick(_.el);

    assert(icons$).to.emitSequence([
      arrayThat<CanvasIcon>().haveExactElements([]),
      arrayThat<CanvasIcon>().haveExactElements([
        objectThat<CanvasIcon>().haveProperties({
          x: 10,
          y: 20,
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
        configName: CONFIG_NAME,
      }]);
    });

    const icons$ = createSpySubject(_.stateService.resolve(_.iconsId));

    run(_.action(_.context));
    triggerClick(_.el);

    assert(icons$).to.emitSequence([
      arrayThat<CanvasIcon>().haveExactElements([
        objectThat<CanvasIcon>().haveProperties({
          x: 10,
          y: 20,
          configName: CONFIG_NAME,
        }),
      ]),
      arrayThat<CanvasIcon>().haveExactElements([]),
    ]);
  });
});
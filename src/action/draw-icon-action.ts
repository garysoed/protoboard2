import {$resolveStateOp, $stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {PersonaContext} from 'persona';
import {Observable, pipe} from 'rxjs';
import {switchMap, tap, map, withLatestFrom} from 'rxjs/operators';

import {CanvasEntry} from '../face/canvas-entry';

import {Action, ActionSpec, TriggerConfig} from './action-spec';
import {ObjectIdObs} from './object-id-obs';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

function actionFactory(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<CanvasEntry>,
    personaContext: PersonaContext,
): Action {
  const stateService = $stateService.get(personaContext.vine);
  const entry$ = objectId$.pipe($resolveStateOp.get(personaContext.vine)());
  const icons$ = entry$.pipe(
      switchMap(entry => {
        return stateService.resolve(entry?.icons);
      }),
  );
  return pipe(
      withLatestFrom(config$, entry$, icons$),
      tap(([, config, entry, icons]) => {
        if (!entry) {
          return;
        }

        const existingIcons = icons ?? [];

        const existingEntry = $pipe(
            existingIcons,
            $find(icon => {
              return icon.configName === config.configName
                    && icon.x === config.x
                    && icon.y === config.y;
            }),
        );

        stateService.modify(x => {
          if (!existingEntry) {
            x.set(entry.icons, [...existingIcons, config]);
            return;
          }

          x.set(
              entry.icons,
              $pipe(existingIcons, $filter(icon => icon !== existingEntry), $asArray()),
          );
        });
      }),
  );
}

export function drawIconAction(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<CanvasEntry>,
    actionName: string,
    context: PersonaContext,
): ActionSpec {
  return {
    action: actionFactory(config$, objectId$, context),
    actionName,
    triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
    trigger$: config$.pipe(createTrigger(context)),
  };
}
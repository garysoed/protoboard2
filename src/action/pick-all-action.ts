import {$stateService} from 'grapevine';
import {$asArray, $pipe, $reverse} from 'gs-tools/export/collect';
import {attributeIn} from 'persona';
import {of, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {pickAction} from './pick-action';


export type Config = TriggerConfig;

export function pickAllAction(params: ActionParams<Config, IsContainer>): Action {
  const targetsId$ = $stateService.get(params.vine)
      .resolve(params.objectId$)
      .$('contentsId')
      .pipe(map(contents => contents ?? []));
  return pipe(
      withLatestFrom(targetsId$),
      switchMap(([event, targetsId]) => {
        const specs = $pipe(targetsId, $reverse(), $asArray());
        return of(...specs).pipe(
            switchMap(targetId => {
              return of(event).pipe(
                  pickAction({...params, objectId$: of(targetId)}),
              );
            }),
        );
      }),
  );
}

const DEFAULT_CONFIG: Config = {
  trigger: {type: TriggerType.CLICK, shift: true},
};

export function pickAllActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-pick-all-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

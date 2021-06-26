import {$stateService} from 'grapevine';
import {attributeIn, enumParser} from 'persona';
import {combineLatest, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';


export enum PositioningType {
  DEFAULT = 'default',
}


export interface Config extends TriggerConfig {
  readonly positioning: PositioningType;
}

export function dropAction({objectId$, vine}: ActionParams<Config, IsContainer>): Action {
  const container$ = $stateService.get(vine).resolve(objectId$);
  const moveParams$ = combineLatest([
    $activeSpec.get(vine).$('contentsId'),
    container$.$('contentsId'),
  ])
      .pipe(
          map(([activeContents, contents]) => {
            const normalizedActiveContents = activeContents ?? [];
            const id = normalizedActiveContents[normalizedActiveContents.length - 1];
            const toIndex = contents?.length ?? 0;
            return {id, toIndex};
          }),
      );

  return pipe(
      withLatestFrom(moveParams$),
      map(([, moveParams]) => moveParams),
      moveObject($activeSpec.get(vine), container$, vine),
  );
}

const DEFAULT_CONFIG = {
  positioning: PositioningType.DEFAULT,
  trigger: {type: TriggerType.D},
};

export function dropActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-drop-trigger', triggerSpecParser(), defaultConfig.trigger),
    positioning: attributeIn(
        'pb-drop-positioning',
        enumParser<PositioningType>(PositioningType),
        defaultConfig.positioning,
    ),
  };
}

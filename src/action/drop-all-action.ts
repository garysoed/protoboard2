import {attributeIn, enumParser} from 'persona';
import {EMPTY, of, pipe} from 'rxjs';
import {repeat, switchMap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {dropAction, PositioningType} from './drop-action';


export interface Config extends TriggerConfig {
  readonly positioning: PositioningType;
}

export function dropAllAction(params: ActionParams<Config, IsContainer>): Action {
  const contentIds$ = $activeSpec.get(params.vine).$('contentsId');

  return pipe(
      withLatestFrom(contentIds$),
      switchMap(([event, contentIds]) => {
        const specs = (contentIds ?? []).length;
        if (!specs) {
          return EMPTY;
        }

        return of(event).pipe(dropAction(params), repeat(specs));
      }),
  );
}

const DEFAULT_CONFIG = {
  positioning: PositioningType.DEFAULT,
  trigger: {type: TriggerType.D, shift: true},
};

export function dropActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-drop-all-trigger', triggerSpecParser(), defaultConfig.trigger),
    positioning: attributeIn(
        'pb-drop-all-positioning',
        enumParser<PositioningType>(PositioningType),
        defaultConfig.positioning,
    ),
  };
}

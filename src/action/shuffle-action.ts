import {$stateService} from 'grapevine';
import {shuffle} from 'gs-tools/export/random';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn} from 'persona';
import {pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {$random} from './util/random';


type Config = TriggerConfig;


export function shuffleAction({context, objectId$}: ActionParams<Config, IsContainer>): Action {
  const stateService = $stateService.get(context.vine);
  const contents$ = stateService.resolve(objectId$).$('$contentSpecs');
  const contentsId$ = stateService.resolve(objectId$)._('$contentSpecs');
  const random = $random.get(context.vine);
  return pipe(
      withLatestFrom(contentsId$, contents$),
      map(([, contentsId, contents]) => {
        if (!contents || !contentsId) {
          return null;
        }

        return {
          contentsId,
          contents: shuffle(contents, random),
        };
      }),
      filterNonNullable(),
      stateService.modifyOperator((x, {contentsId, contents}) => x.set(contentsId, contents)),
  );
}

const DEFAULT_CONFIG: Config = {
  trigger: {type: TriggerType.S},
};

export function shuffleActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-shuffle', triggerSpecParser(), defaultConfig.trigger),
  };
}


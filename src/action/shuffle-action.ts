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


export function shuffleAction({vine, objectPath$}: ActionParams<Config, IsContainer>): Action {
  const stateService = $stateService.get(vine);
  const contentsId = stateService._(objectPath$).$('contentsId');
  const random = $random.get(vine);
  return pipe(
      withLatestFrom(contentsId),
      map(([, contents]) => {
        if (!contents) {
          return null;
        }

        return shuffle(contents, random);
      }),
      filterNonNullable(),
      contentsId.set(),
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


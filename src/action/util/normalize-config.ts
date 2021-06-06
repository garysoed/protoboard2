import {combineLatestObject} from 'gs-tools/export/rxjs';
import {mapObject} from 'gs-tools/export/typescript';
import {PersonaContext} from 'persona';
import {INPUT_TYPE} from 'persona/export/internal';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {DetailedTriggerSpec} from '../../core/trigger-spec';
import {ConfigSpecs, NormalizedTriggerConfig, TriggerConfig} from '../action-spec';


type ObservableConfig<C> = {readonly [K in keyof C]: Observable<C[K]>};

export function compileConfig<C extends TriggerConfig> (
    configSpecs: ConfigSpecs<C>,
    context: PersonaContext,
): Observable<C> {
  const configSpecMap = mapObject<ConfigSpecs<C>, ObservableConfig<C>>(
      configSpecs,
      <K extends keyof C>(_: K, value: ConfigSpecs<C>[K]) => {
        INPUT_TYPE.assert(value);
        return value.getValue(context) as ObservableConfig<C>[K];
      },
  );

  return combineLatestObject(configSpecMap);
}

export function normalizeConfig<C extends TriggerConfig>(
    configSpecs: ConfigSpecs<C>,
    context: PersonaContext,
): Observable<NormalizedTriggerConfig<C>> {
  return compileConfig(configSpecs, context).pipe(
      map(rawConfig => ({
        ...rawConfig,
        trigger: normalizeTrigger(rawConfig.trigger),
      })),
  );
}


function normalizeTrigger(trigger: DetailedTriggerSpec): DetailedTriggerSpec {
  if (typeof trigger === 'string') {
    return {type: trigger};
  }
  return trigger;
}
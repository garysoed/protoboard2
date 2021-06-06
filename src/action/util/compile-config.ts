import {combineLatestObject} from 'gs-tools/export/rxjs';
import {mapObject} from 'gs-tools/export/typescript';
import {PersonaContext} from 'persona';
import {Input, INPUT_TYPE, Resolved, UnresolvedElementProperty} from 'persona/export/internal';
import {Observable} from 'rxjs';

import {TriggerConfig} from '../action-spec';


type ObservableConfig<C> = {readonly [K in keyof C]: Observable<C[K]>};

export type ConfigSpecs<C> = Resolved<
  Element,
  {readonly [K in keyof C]: UnresolvedElementProperty<Element, Input<C[K]>>}
>;

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

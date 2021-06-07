import {$stateService} from 'grapevine';
import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {attributeIn, integerParser, listParser} from 'persona';
import {EMPTY, Observable} from 'rxjs';
import {map, share, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsRotatable} from '../payload/is-rotatable';

import {getObject$} from './action-context';
import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly stops: readonly number[];
}

function actionFactory(config$: Observable<Config>): Action<IsRotatable> {
  return context => {
    const stateService = $stateService.get(context.personaContext.vine);
    return config$.pipe(
        createTrigger(context.personaContext),
        withLatestFrom(config$, getObject$(context)),
        switchMap(([, config, obj]) => {
          if (!obj) {
            return EMPTY;
          }

          const $rotationDeg = obj.$rotationDeg;
          return stateService.resolve($rotationDeg).pipe(
              take(1),
              map(rotationDeg => rotationDeg ?? 0),
              tap(rotationDeg => {
                const stops = config.stops;
                const rotationIndex = $pipe(
                    stops,
                    $zip(countableIterable()),
                    $map(([stop, index]) => {
                      const distance = Math.abs((stop % 360) - (rotationDeg % 360));
                      return [distance, index] as [number, number];
                    }),
                    $asArray(),
                    $sort(withMap(([value]) => value, normal())),
                )[0][1];

                const newIndex = (rotationIndex + 1) % stops.length;
                stateService.modify(x => x.set($rotationDeg, stops[newIndex]));
              }),
              share(),
          );
        }),
    );
  };
}

const DEFAULT_CONFIG: Config = {
  stops: [0, 90, 180, 270],
  trigger: {type: TriggerType.R},
};

export function rotateActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    stops: attributeIn('pb-rotate-stops', listParser(integerParser()), defaultConfig.stops),
    trigger: attributeIn('pb-rotate-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function rotateAction(config$: Observable<Config>): ActionSpec<IsRotatable, Config> {
  return {
    action: actionFactory(config$),
    actionName: 'Rotate',
    config$,
  };
}
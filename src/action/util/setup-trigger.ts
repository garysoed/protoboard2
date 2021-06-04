import {host, onDom, PersonaContext} from 'persona';
import {EMPTY, fromEvent, merge, Observable} from 'rxjs';
import {filter, map, mapTo, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../../core/trigger-event';
import {DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType} from '../../core/trigger-spec';
import {ConfigSpecs, NormalizedTriggerConfig, TriggerConfig} from '../action-spec';

import {normalizeConfig} from './normalize-config';

export interface TriggerContext<C extends TriggerConfig> {
  readonly triggerEvent: TriggerEvent;
  readonly config: NormalizedTriggerConfig<C>;
}


type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

function createTriggerClick(
    triggerSpec: DetailedTriggerSpec<TriggerSpec>,
    context: PersonaContext,
): Observable<MouseEvent&TriggerEvent> {
  const targetEl = triggerSpec.targetEl ?? host({});
  return onDom<MouseEvent>('click')
      .resolve(context => targetEl.getSelectable(context))
      .getValue(context)
      .pipe(
          map(event => {
            return Object.assign(event, {mouseX: event.offsetX, mouseY: event.offsetY});
          }),
      );
}

function createTriggerKey(
    triggerSpec: DetailedTriggerSpec<TriggerType>,
    context: PersonaContext,
): Observable<KeyboardEvent&TriggerEvent> {
  const targetEl = triggerSpec.targetEl ?? host({});
  const onMouseLeave$ = onDom('mouseleave')
      .resolve(context => targetEl.getSelectable(context))
      .getValue(context);
  const onMouseEnter$ = onDom('mouseenter')
      .resolve(context => targetEl.getSelectable(context))
      .getValue(context);
  const onMouseMove$ = onDom<MouseEvent>('mousemove')
      .resolve(context => targetEl.getSelectable(context))
      .getValue(context);
  return merge(
      onMouseLeave$.pipe(mapTo(false)),
      onMouseEnter$.pipe(mapTo(true)),
  )
      .pipe(
          switchMap(hovered => {
            return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
          }),
          withLatestFrom(onMouseMove$.pipe(throttleTime(10))),
          filter(([event]) => event.key === triggerSpec.type),
          map(([keyboardEvent, mouseEvent]) => {
            return Object.assign(
                keyboardEvent,
                {mouseX: mouseEvent.offsetX, mouseY: mouseEvent.offsetY});
          }),
      );
}

export function createTrigger<C extends TriggerConfig>(
    configSpecs: ConfigSpecs<C>,
    context: PersonaContext,
): Observable<TriggerContext<C>> {
  return normalizeConfig(configSpecs, context).pipe(
      switchMap(config => {
        if (!config.trigger) {
          return EMPTY;
        }

        const triggerSpec = config.trigger;
        const trigger$: Observable<RawTriggerEvent> = isKeyTrigger(triggerSpec.type)
          ? createTriggerKey(triggerSpec, context)
          : createTriggerClick(triggerSpec, context);
        return trigger$.pipe(
            filter(event => {
              return event.altKey === (triggerSpec.alt ?? false)
                && event.ctrlKey === (triggerSpec.ctrl ?? false)
                && event.metaKey === (triggerSpec.meta ?? false)
                && event.shiftKey === (triggerSpec.shift ?? false);
            }),
            map(triggerEvent => ({
              triggerEvent,
              config,
            })),
        );
      }),
  );
}


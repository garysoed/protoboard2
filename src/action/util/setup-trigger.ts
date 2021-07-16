import {host, onDom, PersonaContext} from 'persona';
import {EMPTY, fromEvent, merge, Observable, OperatorFunction, pipe} from 'rxjs';
import {filter, map, mapTo, switchMap, tap, throttleTime, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../../core/trigger-event';
import {isKeyTrigger, TriggerSpec} from '../../core/trigger-spec';
import {TriggerConfig} from '../action-spec';


export interface TriggerContext<C extends TriggerConfig> {
  readonly triggerEvent: TriggerEvent;
  readonly config: C;
}

const __handled = Symbol('handled');

interface MaybeHandledEvent extends Event {
  [__handled]?: Element;
}

function createTriggerClick(
    triggerSpec: TriggerSpec,
    context: PersonaContext,
): Observable<TriggerEvent> {
  const targetElSelector = triggerSpec.targetEl ?? host({});
  const targetEl = targetElSelector.getSelectable(context);
  return onDom<MouseEvent>('click')
      .resolve(context => targetElSelector.getSelectable(context))
      .getValue(context)
      .pipe(
          map(event => {
            return {
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
              mouseX: event.offsetX,
              mouseY: event.offsetY,
              targetEl,
            };
          }),
      );
}

function createTriggerKey(
    triggerSpec: TriggerSpec,
    context: PersonaContext,
): Observable<TriggerEvent> {
  const targetElSelector = triggerSpec.targetEl ?? host({});
  const targetEl = targetElSelector.getSelectable(context);
  const onMouseLeave$ = onDom('mouseout')
      .resolve(() => targetEl)
      .getValue(context);
  const onMouseEnter$ = onDom<MaybeHandledEvent>('mouseover')
      .resolve(() => targetEl)
      .getValue(context)
      .pipe(
          filter(event => !event[__handled] || event[__handled] === targetEl),
          tap(event => {
            event[__handled] = targetEl;
          }),
      );
  const onMouseMove$ = onDom<MouseEvent>('mousemove')
      .resolve(() => targetEl)
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
          filter(([event]) => event.key.toLowerCase() === triggerSpec.type),
          map(([keyboardEvent, mouseEvent]) => {
            return {
              altKey: keyboardEvent.altKey,
              ctrlKey: keyboardEvent.ctrlKey,
              metaKey: keyboardEvent.metaKey,
              shiftKey: keyboardEvent.shiftKey,
              mouseX: mouseEvent.offsetX,
              mouseY: mouseEvent.offsetY,
              targetEl,
            };
          }),
      );
}

export function createTrigger<C extends TriggerConfig>(
    context: PersonaContext,
): OperatorFunction<C, TriggerEvent> {
  return pipe(
      switchMap(config => {
        if (!config.trigger) {
          return EMPTY;
        }

        const triggerSpec = config.trigger;
        const trigger$: Observable<TriggerEvent> = isKeyTrigger(triggerSpec.type)
          ? createTriggerKey(triggerSpec, context)
          : createTriggerClick(triggerSpec, context);
        return trigger$.pipe(
            filter(event => {
              return event.altKey === (triggerSpec.alt ?? false)
                && event.ctrlKey === (triggerSpec.ctrl ?? false)
                && event.metaKey === (triggerSpec.meta ?? false)
                && event.shiftKey === (triggerSpec.shift ?? false);
            }),
        );
      }),
  );
}


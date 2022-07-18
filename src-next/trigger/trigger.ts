import {ievent, oevent} from 'persona';
import {EMPTY, fromEvent, merge, Observable, OperatorFunction, pipe} from 'rxjs';
import {filter, map, mapTo, switchMap, switchMapTo, tap, throttleTime, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../types/trigger-spec';

import {TriggerEvent, TRIGGER_EVENT} from './trigger-event';


export function onTrigger(
    triggerSpec$: Observable<TriggerSpec>,
): OperatorFunction<Element, TriggerEvent> {
  return element$ => {
    const dispatchTrigger$ = element$.pipe(dispatchTrigger(), switchMapTo(EMPTY));
    const onTrigger$ = element$.pipe(onInternalTriggerEvent(triggerSpec$));
    return merge(dispatchTrigger$, onTrigger$);
  };
}

function onInternalTriggerEvent(triggerSpec$: Observable<TriggerSpec>): OperatorFunction<Element, TriggerEvent> {
  return pipe(
      switchMap(element => {
        return ievent(TRIGGER_EVENT, TriggerEvent).resolve(element);
      }),
      withLatestFrom(triggerSpec$),
      filter(([event, triggerSpec]) => {
        if (triggerSpec.type === TriggerType.CLICK) {
          return event.details.eventType === 'click';
        }

        return event.details.eventType === 'key'
            && event.details.key === triggerSpec.type;
      }),
      filter(([event, triggerSpec]) => {
        return (triggerSpec.alt === undefined || event.details.altKey === triggerSpec.alt)
        && (triggerSpec.ctrl === undefined || event.details.ctrlKey === triggerSpec.ctrl)
        && (triggerSpec.meta === undefined || event.details.metaKey === triggerSpec.meta)
        && (triggerSpec.shift === undefined || event.details.shiftKey === triggerSpec.shift);
      }),
      tap(([event]) => event.stopImmediatePropagation()),
      map(([event]) => event),
  );
}

const __convertedToTrigger = Symbol('convertedToTrigger');

interface MaybeHandledEvent extends MouseEvent {
  [__convertedToTrigger]?: boolean;
}

function dispatchTrigger(): OperatorFunction<Element, unknown> {
  return switchMap(element => {

    const onClick$ = createOnClick(element);
    const onKey$ = createOnKey(element);
    return merge(onClick$, onKey$).pipe(
        oevent(TRIGGER_EVENT, TriggerEvent).resolve(element)(),
    );
  });
}

function createOnClick(element: Element): Observable<TriggerEvent> {
  return ievent('click', MouseEvent).resolve(element)
      .pipe(
          filterUnhandled(),
          setHandled(),
          map(event => {
            return new TriggerEvent({
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
              mouseClientX: event.clientX,
              mouseClientY: event.clientY,
              eventType: 'click',
              key: null,
            });
          }),
      );
}

function createOnKey(element: Element): Observable<TriggerEvent> {
  const onMouseOut$ = ievent('mouseout', MouseEvent).resolve(element);
  const onMouseOver$ = ievent<MaybeHandledEvent>('mouseover', MouseEvent)
      .resolve(element)
      .pipe(
          filterUnhandled(),
          setHandled(),
      );
  const onMouseMove$ = ievent('mousemove', MouseEvent).resolve(element);
  return merge(
      onMouseOut$.pipe(mapTo(false)),
      onMouseOver$.pipe(mapTo(true)),
  )
      .pipe(
          switchMap(hovered => {
            return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
          }),
          withLatestFrom(onMouseMove$.pipe(throttleTime(10))),
          map(([keyboardEvent, mouseEvent]) => {
            return new TriggerEvent({
              altKey: keyboardEvent.altKey,
              ctrlKey: keyboardEvent.ctrlKey,
              metaKey: keyboardEvent.metaKey,
              shiftKey: keyboardEvent.shiftKey,
              mouseClientX: mouseEvent.clientX,
              mouseClientY: mouseEvent.clientY,
              eventType: 'key',
              key: keyboardEvent.key.toLowerCase(),
            });
          }),
      );
}

function filterUnhandled(): OperatorFunction<MaybeHandledEvent, MaybeHandledEvent> {
  return filter(event => !event[__convertedToTrigger]);
}

function setHandled(): OperatorFunction<MaybeHandledEvent, MaybeHandledEvent> {
  return tap(event => {
    event[__convertedToTrigger] = true;
  });
}
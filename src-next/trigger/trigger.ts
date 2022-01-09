import {ievent} from 'persona';
import {combineLatest, EMPTY, fromEvent, merge, Observable, OperatorFunction} from 'rxjs';
import {filter, map, mapTo, switchMap, tap, throttleTime, withLatestFrom} from 'rxjs/operators';

import {isKeyTrigger, TriggerSpec, TriggerType} from '../types/trigger-spec';

import {TriggerDetails} from './trigger-details';


export function onTrigger(
    triggerSpec$: Observable<TriggerSpec>,
): OperatorFunction<HTMLElement, TriggerDetails> {
  return element$ => {
    return combineLatest([element$, triggerSpec$]).pipe(
        switchMap(([element, spec]) => {
          const onTrigger$ = isKeyTrigger(spec.type)
            ? createOnKey(element, spec.type)
            : createOnClick(element);
          return onTrigger$.pipe(
              filter(event => {
                return (spec.alt === undefined || event.altKey === spec.alt)
                && (spec.ctrl === undefined || event.ctrlKey === spec.ctrl)
                && (spec.meta === undefined || event.metaKey === spec.meta)
                && (spec.shift === undefined || event.shiftKey === spec.shift);
              }),
          );
        }),
    );
  };
}

function createOnClick(element: HTMLElement): Observable<TriggerDetails> {
  return ievent('click', MouseEvent).resolve(element).value$
      .pipe(
          map(event => {
            return {
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
              mouseX: event.offsetX,
              mouseY: event.offsetY,
            };
          }),
      );
}

const __handled = Symbol('handled');

interface MaybeHandledEvent extends MouseEvent {
  [__handled]?: Element;
}

function createOnKey(element: HTMLElement, key: TriggerType): Observable<TriggerDetails> {
  const onMouseLeave$ = ievent('mouseout', MouseEvent).resolve(element).value$;
  const onMouseEnter$ = ievent<MaybeHandledEvent>('mouseover', MouseEvent)
      .resolve(element)
      .value$
      .pipe(
          filter(event => !event[__handled] || event[__handled] === element),
          tap(event => {
            event[__handled] = element;
          }),
      );
  const onMouseMove$ = ievent('mousemove', MouseEvent).resolve(element).value$;
  return merge(
      onMouseLeave$.pipe(mapTo(false)),
      onMouseEnter$.pipe(mapTo(true)),
  )
      .pipe(
          switchMap(hovered => {
            return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
          }),
          filter(event => event.key.toLowerCase() === key),
          withLatestFrom(onMouseMove$.pipe(throttleTime(10))),
          filter(([event]) => event.key.toLowerCase() === key),
          map(([keyboardEvent, mouseEvent]) => {
            return {
              altKey: keyboardEvent.altKey,
              ctrlKey: keyboardEvent.ctrlKey,
              metaKey: keyboardEvent.metaKey,
              shiftKey: keyboardEvent.shiftKey,
              mouseX: mouseEvent.offsetX,
              mouseY: mouseEvent.offsetY,
            };
          }),
      );
}
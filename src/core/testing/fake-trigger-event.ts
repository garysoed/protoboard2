import {TriggerEvent} from '../trigger-event';

export function fakeTriggerEvent(event: Partial<TriggerEvent>): TriggerEvent {
  return {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    mouseX: 0,
    mouseY: 0,
    targetEl: document.body,
    ...event,
  };
}
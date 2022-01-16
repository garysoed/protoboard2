import {Action} from '../action/action';

export const TRIGGER_EVENT = 'pb-trigger';

export class TriggerEvent extends Event {
  constructor(
      readonly action: Action<any, any>,
      readonly id: {},
  ) {
    super(TRIGGER_EVENT, {bubbles: true});
  }
}

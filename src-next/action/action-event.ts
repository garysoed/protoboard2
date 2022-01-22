import {Action} from './action';

export const ACTION_EVENT = 'pb-action';

export class ActionEvent extends Event {
  constructor(
      readonly action: Action<any, any>,
      readonly id: {},
  ) {
    super(ACTION_EVENT, {bubbles: true});
  }
}

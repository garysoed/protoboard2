import {ComponentId} from '../id/component-id';

import {Action} from './action';

export const ACTION_EVENT = 'pb-action';

export class ActionEvent extends Event {
  constructor(
      readonly action: Action<any, any, any>,
      readonly id: ComponentId<unknown>,
  ) {
    super(ACTION_EVENT, {bubbles: true, composed: true});
  }
}

import { _p, ThemedCustomElementCtrl } from '@mask';
import { InitFn } from '@persona';

import { HelpAction } from '../action/help-action';

import { BaseAction } from './base-action';

@_p.baseCustomElement({})
export class BaseComponent extends ThemedCustomElementCtrl {
  private readonly allActions: BaseAction[];

  constructor(
      actions: Iterable<BaseAction>,
      shadowRoot: ShadowRoot,
  ) {
    super(shadowRoot);

    this.allActions = [...actions, new HelpAction(actions)];
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      ...[...this.allActions].map(action => action.install()),
    ];
  }
}

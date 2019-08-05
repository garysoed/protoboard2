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

    const allActions = [...actions];
    const helpAction = new HelpAction(allActions);
    allActions.push(helpAction);
    this.allActions = allActions;
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      ...[...this.allActions].map(action => action.install()),
    ];
  }
}

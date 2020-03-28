import { _p, ThemedCustomElementCtrl } from 'mask';
import { PersonaContext } from 'persona';
import { take } from 'rxjs/operators';

import { HelpAction } from '../action/help-action';

import { BaseAction } from './base-action';


@_p.baseCustomElement({})
export class BaseComponent extends ThemedCustomElementCtrl {
  constructor(
      private readonly actions: readonly BaseAction[],
      context: PersonaContext,
  ) {
    super(context);

    this.setupActions();
  }

  private setupActions(): void {
    const allActions = [...this.actions];
    const helpAction = new HelpAction(this.actions, {shadowRoot: this.shadowRoot, vine: this.vine});
    allActions.push(helpAction);

    this.onDispose$.pipe(take(1)).subscribe(() => {
      for (const action of allActions) {
        action.dispose();
      }
    });
  }
}

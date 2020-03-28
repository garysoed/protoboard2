import { _p, ThemedCustomElementCtrl } from 'mask';
import { PersonaContext } from 'persona';
import { merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    const helpAction = new HelpAction(this.actions);
    allActions.push(helpAction);

    const obs$ = allActions
        .map(action => action.install({vine: this.vine, shadowRoot: this.shadowRoot}));
    merge(...obs$).pipe(takeUntil(this.onDispose$)).subscribe();
  }
}

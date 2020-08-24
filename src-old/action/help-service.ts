import { source } from 'grapevine';
import { BehaviorSubject } from 'rxjs';

import { BaseAction } from '../core/base-action';
import { TriggerSpec } from '../core/trigger-spec';


export interface ActionTrigger {
  readonly action: BaseAction<unknown>;
  readonly trigger: TriggerSpec;
}

export class HelpService {
  readonly actions$ = new BehaviorSubject<readonly ActionTrigger[]>([]);

  hide(): void {
    this.actions$.next([]);
  }

  show(actions: ReadonlyMap<TriggerSpec, BaseAction<unknown>>): void {
    this.actions$.next(
        [...actions].map(([trigger, action]) => ({action, trigger})),
    );
  }
}

export const $helpService = source(() => new HelpService());
import { source } from 'grapevine';
import { ArraySubject } from 'gs-tools/export/rxjs';
import { BehaviorSubject } from 'rxjs';

import { BaseAction } from '../core/base-action';
import { TriggerSpec } from '../core/trigger-spec';

export interface ActionTrigger {
  readonly action: BaseAction<unknown>;
  readonly trigger: TriggerSpec;
}

export class HelpService {
  readonly actions$ = new ArraySubject<ActionTrigger>();

  hide(): void {
    this.actions$.setAll([]);
  }

  show(actions: ReadonlyMap<TriggerSpec, BaseAction<unknown>>): void {
    this.actions$.setAll(
        [...actions].map(([trigger, action]) => ({action, trigger})),
    );
  }
}

export const $helpService = source(() => new BehaviorSubject(new HelpService()), globalThis);

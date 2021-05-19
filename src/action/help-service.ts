import {source} from 'grapevine';
import {BehaviorSubject} from 'rxjs';

import {TriggerSpec} from '../core/trigger-spec';


export interface ActionTrigger {
  readonly actionName: string;
  readonly trigger: TriggerSpec;
}

export class HelpService {
  readonly actions$ = new BehaviorSubject<readonly ActionTrigger[]>([]);

  hide(): void {
    this.actions$.next([]);
  }

  show(actions: ReadonlyMap<TriggerSpec, string>): void {
    this.actions$.next(
        [...actions].map(([trigger, actionName]) => ({actionName, trigger})),
    );
  }
}

export const $helpService = source('HelpService', () => new HelpService());

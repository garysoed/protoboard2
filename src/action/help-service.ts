import {source} from 'grapevine';
import {BehaviorSubject} from 'rxjs';

import {DetailedTriggerSpec} from '../core/trigger-spec';


export interface ActionTrigger {
  readonly actionName: string;
  readonly trigger: DetailedTriggerSpec;
}

export class HelpService {
  readonly actions$ = new BehaviorSubject<readonly ActionTrigger[]>([]);

  hide(): void {
    this.actions$.next([]);
  }

  show(actions: readonly ActionTrigger[]): void {
    this.actions$.next(actions);
  }
}

export const $helpService = source('HelpService', () => new HelpService());

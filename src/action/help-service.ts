import { ArraySubject } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { BehaviorSubject } from '@rxjs';

import { BaseAction } from '../core/base-action';

export class HelpService {
  readonly actions$ = new ArraySubject<BaseAction>();

  hide(): void {
    this.actions$.setAll([]);
  }

  show(actions: Iterable<BaseAction>): void {
    this.actions$.setAll([...actions]);
  }
}

export const $helpService = _v.source(() => new BehaviorSubject(new HelpService()), globalThis);

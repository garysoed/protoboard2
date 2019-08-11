import { ArraySubject } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { BehaviorSubject } from '@rxjs';

import { BaseAction } from '../core/base-action';

export class HelpService {
  readonly actions$ = new ArraySubject<BaseAction<any>>();

  hide(): void {
    this.actions$.setAll([]);
  }

  show(actions: Iterable<BaseAction<any>>): void {
    this.actions$.setAll([...actions]);
  }
}

export const $helpService = _v.source(() => new BehaviorSubject(new HelpService()), globalThis);

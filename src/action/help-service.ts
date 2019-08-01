import { _v } from '@mask';
import { BehaviorSubject } from '@rxjs';

import { BaseAction } from '../core/base-action';

export interface HelpSpec {
  actions: Iterable<BaseAction>;
  target: Element;
}

class HelpService {
  readonly helpSpec$ = new BehaviorSubject<HelpSpec|null>(null);

  hide(): void {
    this.helpSpec$.next(null);
  }

  show(actions: Iterable<BaseAction>, target: Element): void {
    this.helpSpec$.next({actions, target});
  }
}

export const $helpService = _v.source(() => new BehaviorSubject(new HelpService()), globalThis);

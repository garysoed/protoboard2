import { Vine } from 'grapevine';
import { $pipe, $reverse, arrayFrom } from 'gs-tools/export/collect';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';

/**
 * Reverses the child elements.
 */
export class ReverseAction extends BaseAction {
  constructor(vine: Vine) {
    super('reverse', 'Reverse children', {}, vine);

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom(this.host$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, hostEl]) => {
          const children = $pipe(arrayFrom(hostEl.children), $reverse());
          for (const child of children) {
            hostEl.appendChild(child);
          }
        });
  }
}

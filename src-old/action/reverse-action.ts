import { Vine } from 'grapevine';
import { $pipe, $reverse, arrayFrom } from 'gs-tools/export/collect';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';

/**
 * Reverses the child elements.
 */
export class ReverseAction extends BaseAction {
  constructor(vine: Vine) {
    super('reverse', 'Reverse children', {}, vine);

    this.addSetup(this.setupHandleTrigger());
  }

  private setupHandleTrigger(): Observable<unknown> {
    return this.onTrigger$
        .pipe(
            withLatestFrom(this.host$),
            tap(([, hostEl]) => {
              const children = $pipe(arrayFrom(hostEl.children), $reverse());
              for (const child of children) {
                hostEl.appendChild(child);
              }
            }),
        );
  }
}

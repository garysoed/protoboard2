import { Vine } from 'grapevine';
import { shuffle } from 'gs-tools/export/random';
import { element } from 'persona';
import { switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { $random } from '../util/random';


export class ShuffleAction extends BaseAction {
  constructor(vine: Vine) {
    super(
        'shuffle',
        'Shuffle',
        {},
        vine,
    );

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    const host$ = this.actionTarget$
        .pipe(switchMap(shadowRoot => element({}).getValue(shadowRoot)));

    this.onTrigger$
        .pipe(
            withLatestFrom(host$, $random.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, hostEl, rng]) => {
          const children: Node[] = [];
          for (let i = 0; i < hostEl.children.length; i++) {
            const childEl = hostEl.children.item(i);
            if (!childEl) {
              continue;
            }
            children.push(childEl);
          }

          const newRng = shuffle(children, rng);
          $random.get(this.vine).next(newRng.map(() => undefined));

          for (const childEl of newRng.value) {
            hostEl.appendChild(childEl);
          }
        });
  }
}

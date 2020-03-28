import { shuffle } from 'gs-tools/export/random';
import { element, PersonaContext } from 'persona';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';
import { $random } from '../util/random';


export class ShuffleAction extends BaseAction {
  constructor(context: PersonaContext) {
    super(
        'shuffle',
        'Shuffle',
        {},
        {type: TriggerType.KEY, key: TriggerKey.S},
        context,
    );

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom(
                element({}).getValue(this.shadowRoot),
                $random.get(this.vine),
            ),
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

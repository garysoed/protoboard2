import { Vine } from 'grapevine';
import { shuffle } from 'gs-tools/export/random';
import { element } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';
import { $random } from '../util/random';


export class ShuffleAction extends BaseAction {
  constructor() {
    super(
        'shuffle',
        'Shuffle',
        {},
        {type: TriggerType.KEY, key: TriggerKey.S},
    );
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(
      trigger$: Observable<unknown>,
      vine: Vine,
      root: ShadowRoot,
  ): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom(
            element({}).getValue(root),
            $random.get(vine),
        ),
        tap(([, hostEl, rng]) => {
          const children: Node[] = [];
          for (let i = 0; i < hostEl.children.length; i++) {
            const childEl = hostEl.children.item(i);
            if (!childEl) {
              continue;
            }
            children.push(childEl);
          }

          const newRng = shuffle(children, rng);
          $random.get(vine).next(newRng.map(() => undefined));

          for (const childEl of newRng.value) {
            hostEl.appendChild(childEl);
          }
        }),
    );
  }
}

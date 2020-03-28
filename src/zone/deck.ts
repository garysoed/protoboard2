import { Vine } from 'grapevine';
import { aleaSeed, fromSeed, Random, shuffle } from 'gs-tools/export/random';
import { _p } from 'mask';
import { element, stringParser } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { DropAction } from '../action/drop-action';
import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerKey, TriggerType } from '../core/trigger-spec';

import template from './deck.html';


const $ = {
  host: element({}),
};

export class ShuffleAction extends BaseAction {
  private rng: Random<unknown> = fromSeed(aleaSeed(this.seed));

  constructor(private readonly seed: unknown = '') {
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
      _: Vine,
      root: ShadowRoot,
  ): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom($.host.getValue(root)),
        tap(([, hostEl]) => {
          const children: Node[] = [];
          for (let i = 0; i < hostEl.children.length; i++) {
            const childEl = hostEl.children.item(i);
            if (!childEl) {
              continue;
            }
            children.push(childEl);
          }

          const newRng = shuffle(children, this.rng);
          this.rng = newRng;

          for (const childEl of newRng.value) {
            hostEl.appendChild(childEl);
          }
        }),
    );
  }
}

@_p.customElement({
  tag: 'pb-deck',
  template,
})
export class Deck extends BaseComponent {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(
        [
          new DropAction($.host.getValue(shadowRoot)),
          new ShuffleAction(),
        ],
        shadowRoot,
        vine,
    );
  }
}

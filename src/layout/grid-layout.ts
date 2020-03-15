import { Vine } from 'grapevine';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, integerParser, mutationObservable } from 'persona';
import { combineLatest, of as observableOf, Subscription } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';

import template from './grid-layout.html';


const __mutationSubscription = Symbol('mutationSubscription');
const __oldValue = Symbol('oldValue');

interface Payload {
  slot: string|null;
}

interface NodeWithPayload extends Node {
  [__mutationSubscription]?: Subscription;
  [__oldValue]?: Payload;
}

export const $$ = {
  api: {
    colCount: attributeIn('column-count', integerParser(), 1),
    rowCount: attributeIn('row-count', integerParser(), 1),
  },
  tag: 'pb-grid-layout',
};

export const $ = {
  host: element($$.api),
  rows: element('rows', instanceofType(HTMLDivElement), {}),
};

@_p.customElement({
  ...$$,
  template,
})
export class GridLayout extends ThemedCustomElementCtrl {
  private readonly colCount$ = this.declareInput($.host._.colCount);
  private readonly host$ = this.declareInput($.host);
  private readonly rowCount$ = this.declareInput($.host._.rowCount);
  private readonly rowsEl$ = this.declareInput($.rows);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.setupOnHostMutation();
    this.setupRenderGrid();
  }

  private setupOnHostMutation(): void {
    this.host$
        .pipe(
            switchMap(hostEl => mutationObservable(hostEl, {childList: true})),
            switchMap(records => observableOf(...records)),
            takeUntil(this.onDispose$),
        )
        .subscribe(record => {
          record.addedNodes.forEach((node: NodeWithPayload) => {
            node[__oldValue] = getOldPayload(node);

            const subscription = mutationObservable(
                    node,
                    {attributes: true, attributeFilter: ['x', 'y']},
                )
                .pipe(startWith({}))
                .subscribe(() => {
                  if (!(node instanceof HTMLElement)) {
                    return;
                  }

                  const x = getIntAttr(node, 'x');
                  const y = getIntAttr(node, 'y');
                  node.setAttribute('slot', `${y}_${x}`);
                });
            node[__mutationSubscription] = subscription;
          });

          record.removedNodes.forEach((node: NodeWithPayload) => {
            const subscription = node[__mutationSubscription];
            if (subscription) {
              subscription.unsubscribe();
            }

            const oldValue = node[__oldValue];
            if (node instanceof HTMLElement && oldValue) {
              node.setAttribute('slot', oldValue.slot || '');
            }
          });
        });
  }

  private setupRenderGrid(): void {
    combineLatest([this.colCount$, this.rowCount$, this.rowsEl$])
        .pipe(takeUntil(this.onDispose$))
        .subscribe(([cols, rows, rowsEl]) => {
          // Empty the content of rowsEl
          rowsEl.innerHTML = '';

          for (let row = 0; row < rows; row++) {
            const rowEl = document.createElement('div');
            rowEl.setAttribute('layout', 'row');
            rowEl.setAttribute('flex', '');
            for (let col = 0; col < cols; col++) {
              const slotEl = document.createElement('slot');
              slotEl.setAttribute('name', `${row}_${col}`);

              const colEl = document.createElement('div');
              colEl.classList.add('col');
              colEl.setAttribute('flex', '');
              colEl.appendChild(slotEl);

              rowEl.appendChild(colEl);
            }

            rowsEl.appendChild(rowEl);
          }
        });
  }
}

function getOldPayload(node: Node): Payload {
  if (!(node instanceof HTMLElement)) {
    return {slot: null};
  }

  return {
    slot: node.getAttribute('slot'),
  };
}

function getIntAttr(el: HTMLElement, attrName: string): number {
  const result = integerParser().convertBackward(el.getAttribute(attrName) || '');
  return result.success ? result.result : 0;
}

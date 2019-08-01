import { InstanceofType } from '@gs-types';
import { _p, integerParser, ThemedCustomElementCtrl } from '@mask';
import { attributeIn, element, InitFn, mutationObservable } from '@persona';
import { combineLatest, Observable, of as observableOf, Subscription } from '@rxjs';
import { startWith, switchMap, tap } from '@rxjs/operators';

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
  colCount: attributeIn('column-count', integerParser(), 1),
  rowCount: attributeIn('row-count', integerParser(), 1),
};

export const $ = {
  host: element($$),
  rows: element('rows', InstanceofType(HTMLDivElement), {}),
};

@_p.customElement({
  tag: 'pb-grid-layout',
  template,
})
export class GridLayout extends ThemedCustomElementCtrl {
  private readonly colCount$ = _p.input($.host._.colCount, this);
  private readonly host$ = _p.input($.host, this);
  private readonly rowCount$ = _p.input($.host._.rowCount, this);
  private readonly rowsEl$ = _p.input($.rows, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupOnHostMutation(),
      () => this.setupRenderGrid(),
    ];
  }

  private setupOnHostMutation(): Observable<unknown> {
    return this.host$.pipe(
        switchMap(hostEl => mutationObservable(hostEl, {childList: true})),
        switchMap(records => observableOf(...records)),
        tap(record => {
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
        }),
    );
  }

  private setupRenderGrid(): Observable<unknown> {
    return combineLatest([this.colCount$, this.rowCount$, this.rowsEl$]).pipe(
        tap(([cols, rows, rowsEl]) => {
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
        }),
    );
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

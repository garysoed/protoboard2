import { _p } from '@mask';
import { CustomElementCtrl, element, InitFn, mutationObservable } from '@persona';
import { of as observableOf, Subscription } from '@rxjs';
import { map, startWith, switchMap, tap } from '@rxjs/operators';
import template from './free-layout.html';

const __mutationSubscription = Symbol('mutationSubscription');
const __oldValue = Symbol('oldValue');

interface Payload {
  left: string|null;
  top: string|null;
}

interface NodeWithPayload extends Node {
  [__mutationSubscription]?: Subscription;
  [__oldValue]?: Payload;
}

const $ = {
  host: element({}),
};

@_p.customElement({
  tag: 'pb-free-layout',
  template,
})
export class FreeLayout extends CustomElementCtrl {
  private readonly host$ = _p.input($.host, this);

  getInitFunctions(): InitFn[] {
    return [
      this.setupOnHostMutation(),
    ];
  }

  private setupOnHostMutation(): InitFn {
    return () => this.host$.pipe(
        switchMap(hostEl => mutationObservable(hostEl, {childList: true})),
        switchMap(records => observableOf(...records)),
        tap(record => {
          record.addedNodes.forEach((node: NodeWithPayload) => {
            node[__oldValue] = getOldPayload(node);

            const subscription = mutationObservable(
                    node,
                    {attributes: true, attributeFilter: ['x', 'y']},
                )
                .pipe(
                    map(records => records.map(({attributeName}) => attributeName)),
                    startWith(['x', 'y']),
                    switchMap(attributeNames => observableOf(...attributeNames)),
                )
                .subscribe(attributeName => {
                  if (!(node instanceof HTMLElement) || !attributeName) {
                    return;
                  }

                  const attributeValue = node.getAttribute(attributeName);
                  switch (attributeName) {
                    case 'x':
                      node.style.left = `${attributeValue}px`;
                      break;
                    case 'y':
                      node.style.top = `${attributeValue}px`;
                      break;
                  }
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
              node.style.left = oldValue.left;
              node.style.top = oldValue.top;
            }
          });
        }),
    );
  }
}

function getOldPayload(node: Node): Payload {
  if (!(node instanceof HTMLElement)) {
    return {left: null, top: null};
  }

  return {left: node.style.left, top: node.style.top};
}


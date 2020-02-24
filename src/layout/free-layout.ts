import { Vine } from 'grapevine';
import { _p } from 'mask';
import { CustomElementCtrl, element, mutationObservable } from 'persona';
import { of as observableOf, Subscription } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import template from './free-layout.html';


const __mutationSubscription = Symbol('mutationSubscription');
const __oldValue = Symbol('oldValue');

interface Payload {
  height: string|null;
  left: string|null;
  position: string|null;
  top: string|null;
  width: string|null;
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
  private readonly host$ = this.declareInput($.host);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.setupOnHostMutation();
  }

  private setupOnHostMutation(): void {
    this.host$
        .pipe(
            switchMap(hostEl => mutationObservable(hostEl, {childList: true})),
            takeUntil(this.onDispose$),
        )
        .subscribe(records => {
          for (const record of records) {
            record.addedNodes.forEach((node: NodeWithPayload) => {
              node[__oldValue] = getOldPayload(node);

              const subscription = mutationObservable(
                      node,
                      {attributes: true, attributeFilter: ['x', 'y', 'height', 'width']},
                  )
                  .pipe(
                      map(records => records.map(({attributeName}) => attributeName)),
                      startWith(['x', 'y', 'height', 'width']),
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
                      case 'height':
                        node.style.height = `${attributeValue}px`;
                        break;
                      case 'width':
                        node.style.width = `${attributeValue}px`;
                        break;
                    }
                    node.style.position = 'absolute';
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
                node.style.left = oldValue.left || '';
                node.style.top = oldValue.top || '';
                node.style.height = oldValue.height || '';
                node.style.width = oldValue.width || '';
              }
            });
          }
        });
  }
}

function getOldPayload(node: Node): Payload {
  if (!(node instanceof HTMLElement)) {
    return {left: null, top: null, height: null, width: null, position: null};
  }

  return {
    height: node.style.height,
    left: node.style.left,
    position: node.style.position,
    top: node.style.top,
    width: node.style.width,
  };
}


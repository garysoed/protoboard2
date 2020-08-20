import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, host, onDom, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { $lensService } from './lens-service';
import template from './lens.html';


export const $$ = {
  tag: 'pb-lens',
  api: {},
};

export const $ = {
  host: host({
    onMouseOver: onDom('mouseover'),
    onMouseOut: onDom('mouseout'),
  }),
  details: element('details', instanceofType(HTMLSlotElement), {
    onSlotChange: onDom('slotchange'),
  }),
};

@_p.customElement({
  ...$$,
  template,
})
export class Lens extends ThemedCustomElementCtrl {
  private readonly lensService$ = $lensService.get(this.vine);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupHandleMouseOut());
    this.addSetup(this.setupHandleMouseOver());
  }

  private setupHandleMouseOut(): Observable<unknown> {
    return this.declareInput($.host._.onMouseOut).pipe(
        withLatestFrom(this.lensService$),
        tap(([, lensService]) => {
          lensService.hide(this);
        }),
    );
  }

  private setupHandleMouseOver(): Observable<unknown> {
    return this.declareInput($.host._.onMouseOver).pipe(
        withLatestFrom(this.declareInput($.details), this.lensService$),
        tap(([, slotEl, lensService]) => {
          const assignedNodes = slotEl.assignedNodes();
          const documentFragment = document.createDocumentFragment();
          for (const node of assignedNodes) {
            documentFragment.appendChild(node.cloneNode(true));
          }

          lensService.show(this, documentFragment);
        }),
    );
  }
}

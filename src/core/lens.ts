import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, host, onDom, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { $lensService } from './lens-service';
import template from './lens.html';


export const $lens = {
  tag: 'pb-lens',
  api: { },
};

export const $ = {
  host: host({
    ...$lens.api,
    onMouseOver: onDom('mouseover'),
    onMouseOut: onDom('mouseout'),
  }),
  details: element('details', instanceofType(HTMLSlotElement), {
    onSlotChange: onDom('slotchange'),
  }),
};

@_p.customElement({
  ...$lens,
  template,
})
export class Lens extends ThemedCustomElementCtrl {
  private readonly lensService$ = $lensService.get(this.vine);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleMouseOut$);
    this.addSetup(this.handleMouseOver$);
  }

  @cache()
  private get handleMouseOut$(): Observable<unknown> {
    return this.declareInput($.host._.onMouseOut).pipe(
        withLatestFrom(this.lensService$),
        tap(([, lensService]) => {
          lensService.hide(this);
        }),
    );
  }

  @cache()
  private get handleMouseOver$(): Observable<unknown> {
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

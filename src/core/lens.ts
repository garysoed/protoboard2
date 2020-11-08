import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {ThemedCustomElementCtrl, _p} from 'mask';
import {PersonaContext, element, host, onDom} from 'persona';
import {Observable} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {$lensService} from './lens-service';
import template from './lens.html';


export const $lens = {
  tag: 'pb-lens',
  api: { },
};

export const $ = {
  host: host({
    ...$lens.api,
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
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

    this.addSetup(this.handleMouseLeave$);
    this.addSetup(this.handleMouseEnter$);
  }

  @cache()
  private get handleMouseLeave$(): Observable<unknown> {
    return this.declareInput($.host._.onMouseLeave).pipe(
        withLatestFrom(this.lensService$),
        tap(([, lensService]) => {
          lensService.hide(this);
        }),
    );
  }

  @cache()
  private get handleMouseEnter$(): Observable<unknown> {
    return this.declareInput($.host._.onMouseEnter).pipe(
        withLatestFrom(this.lensService$),
        tap(([, lensService]) => {
          const assignedNodes = $.details.getSelectable(this.context).assignedNodes();
          const documentFragment = document.createDocumentFragment();
          for (const node of assignedNodes) {
            documentFragment.appendChild(node.cloneNode(true));
          }

          lensService.show(this, documentFragment);
        }),
    );
  }
}

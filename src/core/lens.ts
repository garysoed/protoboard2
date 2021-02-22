import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {BaseThemedCtrl, _p} from 'mask';
import {element, host, onDom, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

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
export class Lens extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.handleMouseLeave$);
    this.addSetup(this.handleMouseEnter$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }

  @cache()
  private get handleMouseLeave$(): Observable<unknown> {
    return this.inputs.host.onMouseLeave.pipe(
        tap(() => {
          $lensService.get(this.vine).hide(this);
        }),
    );
  }

  @cache()
  private get handleMouseEnter$(): Observable<unknown> {
    return this.inputs.host.onMouseEnter.pipe(
        tap(() => {
          const assignedNodes = $.details.getSelectable(this.context).assignedNodes();
          const documentFragment = document.createDocumentFragment();
          for (const node of assignedNodes) {
            documentFragment.appendChild(node.cloneNode(true));
          }

          $lensService.get(this.vine).show(this, documentFragment);
        }),
    );
  }
}

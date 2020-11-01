import { Observable } from 'rxjs';
import { PersonaContext, element } from 'persona';
import { ThemedCustomElementCtrl, _p } from 'mask';
import { instanceofType } from 'gs-types';
import { switchMap, tap } from 'rxjs/operators';

import { $lensService } from './lens-service';
import template from './lens-display.html';


export const $lensDisplay = {
  tag: 'pb-lens-display',
  api: {},
};

export const $ = {
  root: element('root', instanceofType(HTMLDivElement), {}),
};

@_p.customElement({
  ...$lensDisplay,
  template,
})
export class LensDisplay extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupRenderContent());
  }

  private setupRenderContent(): Observable<unknown> {
    return $lensService.get(this.vine).pipe(
        switchMap(service => service.onNodes$),
        tap(nodes => {
          const rootEl = $.root.getSelectable(this.context);
          rootEl.innerHTML = '';
          if (!nodes) {
            return;
          }

          rootEl.appendChild(nodes.cloneNode(true));
        }),
    );
  }
}

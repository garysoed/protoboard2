import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import template from './lens-display.html';
import { $lensService } from './lens-service';

export const $$ = {
  tag: 'pb-lens-display',
};

export const $ = {
  root: element('root', instanceofType(HTMLDivElement), {}),
};

@_p.customElement({
  ...$$,
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
        withLatestFrom($.root.getValue(this.shadowRoot)),
        tap(([nodes, rootEl]) => {
          rootEl.innerHTML = '';
          if (!nodes) {
            return;
          }

          rootEl.appendChild(nodes.cloneNode(true));
        }),
    );
  }
}

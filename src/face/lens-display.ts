import {cache} from 'gs-tools/export/data';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import template from './lens-display.html';
import {$lensService} from './lens-service';


export const $lensDisplay = {
  tag: 'pb-lens-display',
  api: {},
};

export const $ = {
  root: element('root', $div, {}),
};

@_p.customElement({
  ...$lensDisplay,
  template,
})
export class LensDisplay extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.setupRenderContent());
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }

  private setupRenderContent(): Observable<unknown> {
    return $lensService.get(this.vine).onNodes$.pipe(
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

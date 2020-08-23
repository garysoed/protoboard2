import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, host, PersonaContext, single, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import template from './render.html';
import { $stateService } from './state-service';


export const $render = {
  tag: 'pb-render',
  api: {
    objectId: attributeIn('object-id', stringParser()),
  },
};

const $ = {
  host: host($render.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$render,
  template,
})
export class Render extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.root._.content, this.object$);
  }

  @cache()
  private get object$(): Observable<Node|null> {
    return combineLatest([
      this.declareInput($.host._.objectId),
      $stateService.get(this.vine),
    ])
    .pipe(
        switchMap(([objectId, stateService]) => {
          if (!objectId) {
            return observableOf(null);
          }
          return stateService.getObject(objectId, this.context) || observableOf(null);
        }),
    );
  }
}

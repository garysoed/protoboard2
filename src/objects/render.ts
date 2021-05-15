import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {$div, attributeIn, element, host, PersonaContext, RenderSpec, single} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';

import {$getRenderSpec} from './object-create-spec';
import template from './render.html';


export const $render = {
  tag: 'pb-render',
  api: {
    objectId: attributeIn('object-id', stateIdParser<ObjectSpec<any>>()),
  },
};

const $ = {
  host: host($render.api),
  root: element('root', $div, {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$render,
  template,
})
export class Render extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.content(this.object$),
    ];
  }
  @cache()
  private get object$(): Observable<RenderSpec|undefined> {
    return combineLatest([
      this.inputs.host.objectId,
      $getRenderSpec.get(this.vine),
    ])
        .pipe(
            switchMap(([objectId, getRenderSpec]) => {
              if (!objectId) {
                return observableOf(undefined);
              }
              return getRenderSpec(objectId, this.vine);
            }),
            mapNullableTo<RenderSpec|undefined>(undefined),
        );
  }
}

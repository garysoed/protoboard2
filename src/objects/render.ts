import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, element, host, NodeWithId, PersonaContext, single} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {$getObjectNode} from './object-service';
import {ObjectSpec} from './object-spec';
import template from './render.html';


export const $render = {
  tag: 'pb-render',
  api: {
    objectId: attributeIn('object-id', stateIdParser<ObjectSpec<any>>()),
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
  private get object$(): Observable<NodeWithId<Node>|null> {
    return combineLatest([
      this.inputs.host.objectId,
      $getObjectNode.get(this.vine),
    ])
        .pipe(
            switchMap(([objectId, getObjectNode]) => {
              if (!objectId) {
                return observableOf(null);
              }
              return getObjectNode(objectId, this.context);
            }),
        );
  }
}

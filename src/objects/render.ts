import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, element, host, PersonaContext, renderNode, RenderSpec, single} from 'persona';
import {__id} from 'persona/src/render/node-with-id';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';

import {$getObjectNode} from './object-service';
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
  private get object$(): Observable<RenderSpec|null> {
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
            map(node => {
              // TODO: Remove the [__id], make RenderSpec accept NodeWithId.
              return node ? renderNode({node, id: node[__id]}) : null;
            }),
        );
  }
}

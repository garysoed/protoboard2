import {renderSvg} from 'almagest';
import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {ObjectPath} from 'gs-tools/export/state';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, element, PersonaContext, renderNode, RenderSpec, single} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$canvas, Canvas, canvasSpec} from '../../src/face/canvas';
import {CanvasSpec} from '../../src/face/canvas-entry';
import canvasBgSvg from '../asset/canvas_bg.svg';
import {DocumentationTemplate} from '../template/documentation-template';

import {$canvasNode, CanvasNode} from './canvas-node';
import template from './canvas.html';


type State = CanvasSpec;

const $stateId = rootStateIdSource(() => canvasSpec({}));
const $statePath = immutablePathSource($stateId);

export const $canvasDemo = {
  tag: 'pbd-canvas',
  api: {},
};

const $ = {
  background: element('background', $div, {
    content: single('#content'),
  }),
  canvas: element('canvas', $canvas, {}),
  circleNode: element('circleNode', $canvasNode, {}),
  noneNode: element('noneNode', $canvasNode, {}),
  squareNode: element('squareNode', $canvasNode, {}),
  triangleNode: element('triangleNode', $canvasNode, {}),
};

@_p.customElement({
  ...$canvasDemo,
  template,
  dependencies: [
    Canvas,
    CanvasNode,
    DocumentationTemplate,
  ],
})
export class CanvasDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.background.content(this.backgroundSvg$),
      this.renderers.canvas.objectPath(this.objectPath$),
      this.renderers.circleNode.objectId(this.objectPath$),
      this.renderers.noneNode.objectId(this.objectPath$),
      this.renderers.squareNode.objectId(this.objectPath$),
      this.renderers.triangleNode.objectId(this.objectPath$),
    ];
  }

  @cache()
  private get backgroundSvg$(): Observable<RenderSpec> {
    return renderSvg({
      type: 'template',
      document: this.context.shadowRoot.ownerDocument,
      content: canvasBgSvg,
    })
        .pipe(
            map(el => renderNode({
              node: el,
              id: {},
            })),
        );
  }

  @cache()
  private get objectPath$(): Observable<ObjectPath<State>> {
    return of($statePath.get(this.vine));
  }
}
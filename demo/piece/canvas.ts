import {renderSvg} from 'almagest';
import {$stateService, source} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, element, PersonaContext, renderNode, RenderSpec, single} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$canvas, Canvas, canvasSpec} from '../../src/face/canvas';
import {CanvasEntry} from '../../src/face/canvas-entry';
import canvasBgSvg from '../asset/canvas_bg.svg';
import {DocumentationTemplate} from '../template/documentation-template';

import {$canvasNode, CanvasNode} from './canvas-node';
import template from './canvas.html';

type State = CanvasEntry;

const $stateId = source(vine => $stateService.get(vine).modify(x => x.add(canvasSpec({}, x))));

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
      this.renderers.canvas.objectId(this.objectId$),
      this.renderers.circleNode.objectId(this.objectId$),
      this.renderers.noneNode.objectId(this.objectId$),
      this.renderers.squareNode.objectId(this.objectId$),
      this.renderers.triangleNode.objectId(this.objectId$),
    ];
  }

  @cache()
  private get backgroundSvg$(): Observable<RenderSpec> {
    return renderSvg({
      type: 'template',
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
  private get objectId$(): Observable<StateId<State>> {
    return of($stateId.get(this.vine));
  }
}
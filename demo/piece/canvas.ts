import {renderSvg} from 'almagest';
import {cache} from 'gs-tools/export/data';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, element, PersonaContext, renderNode, RenderSpec, single} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Canvas} from '../../src/face/canvas';
import canvasBgSvg from '../asset/canvas_bg.svg';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './canvas.html';

export const $canvasDemo = {
  tag: 'pbd-canvas',
  api: {},
};

const $ = {
  background: element('background', $div, {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$canvasDemo,
  template,
  dependencies: [
    Canvas,
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
}
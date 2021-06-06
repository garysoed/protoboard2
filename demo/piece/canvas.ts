import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {Canvas} from '../../src/face/canvas';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './canvas.html';

export const $canvasDemo = {
  tag: 'pbd-canvas',
  api: {},
};

const $ = {

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
    return [];
  }
}
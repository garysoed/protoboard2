import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { FreeLayout as FreeLayoutImpl } from '../../src/layout/free-layout';

import template from './free-layout.html';
import { $$ as $layoutTemplate, LayoutTemplate } from './layout-template';


const $ = {
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', ElementWithTagType('mk-text-input'), api($textInput.api)),
  y: element('y', ElementWithTagType('mk-text-input'), api($textInput.api)),
  height: element('height', ElementWithTagType('mk-text-input'), api($textInput.api)),
  width: element('width', ElementWithTagType('mk-text-input'), api($textInput.api)),
};

@_p.customElement({
  dependencies: [
    FreeLayoutImpl,
    LayoutTemplate,
    TextInput,
  ],
  tag: 'pbd-free-layout',
  template,
})
export class FreeLayout extends ThemedCustomElementCtrl {
  private readonly onAddDropZone$ = this.declareInput($.template._.onAddDropZone);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleAddDropZone();
  }

  private setupHandleAddDropZone(): Observable<unknown> {
    return this.onAddDropZone$.pipe(
        withLatestFrom(
            $.x._.value.getValue(this.shadowRoot),
            $.y._.value.getValue(this.shadowRoot),
            $.height._.value.getValue(this.shadowRoot),
            $.width._.value.getValue(this.shadowRoot),
        ),
        tap(([event, x, y, height, width]) => {
          event.addDropZone(new Map([
            ['x', x],
            ['y', y],
            ['height', height],
            ['width', width],
          ]));
        }),
    );
  }
}

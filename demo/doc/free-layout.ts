import { ElementWithTagType } from '@gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { FreeLayout as FreeLayoutImpl } from '../../src/layout/free-layout';

import template from './free-layout.html';
import { $$ as $layoutTemplate, LayoutTemplate } from './layout-template';


const $ = {
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', ElementWithTagType('mk-text-input'), api($textInput)),
  y: element('y', ElementWithTagType('mk-text-input'), api($textInput)),
  height: element('height', ElementWithTagType('mk-text-input'), api($textInput)),
  width: element('width', ElementWithTagType('mk-text-input'), api($textInput)),
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
  private readonly onAddDropZone$ = _p.input($.template._.onAddDropZone, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      (_, root) => this.setupHandleAddDropZone(root),
    ];
  }

  private setupHandleAddDropZone(root: ShadowRoot): Observable<unknown> {
    return this.onAddDropZone$.pipe(
        withLatestFrom(
            $.x._.value.getValue(root),
            $.y._.value.getValue(root),
            $.height._.value.getValue(root),
            $.width._.value.getValue(root),
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

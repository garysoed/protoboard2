import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element } from 'persona';
import { of as observableOf } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { $$ as $freeLayout, FreeLayout as FreeLayoutImpl } from '../../src/layout/free-layout';
import { $$ as $layoutTemplate, LayoutTemplate } from '../template/layout-template';

import template from './free-layout.html';


const $$ = {
  tag: 'pbd-free-layout',
};

const $ = {
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', ElementWithTagType('mk-text-input'), api($textInput.api)),
  y: element('y', ElementWithTagType('mk-text-input'), api($textInput.api)),
  height: element('height', ElementWithTagType('mk-text-input'), api($textInput.api)),
  width: element('width', ElementWithTagType('mk-text-input'), api($textInput.api)),
};

@_p.customElement({
  ...$$,
  dependencies: [
    FreeLayoutImpl,
    LayoutTemplate,
    TextInput,
  ],
  template,
})
export class FreeLayout extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleSetLayout();
  }

  private setupHandleSetLayout(): void {
    this.declareInput($.template._.onSetLayout)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(event => {
          event.setLayout({
            addZoneRender$: observableOf(null),
            attr: new Map<string, string>(),
            tag: $freeLayout.tag,
          });
        });
  }
}

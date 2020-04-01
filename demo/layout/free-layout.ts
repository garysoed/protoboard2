import { elementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element, PersonaContext } from 'persona';
import { takeUntil } from 'rxjs/operators';

import { $$ as $freeLayout, FreeLayout as FreeLayoutImpl } from '../../src/layout/free-layout';
import { $$ as $layoutTemplate, LayoutTemplate } from '../template/layout-template';

import { FreeLayoutAddZone, getZoneAttr } from './free-layout-add-zone';
import template from './free-layout.html';


const $$ = {
  tag: 'pbd-free-layout',
};

const $ = {
  template: element('template', elementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', elementWithTagType('mk-text-input'), api($textInput.api)),
  y: element('y', elementWithTagType('mk-text-input'), api($textInput.api)),
  height: element('height', elementWithTagType('mk-text-input'), api($textInput.api)),
  width: element('width', elementWithTagType('mk-text-input'), api($textInput.api)),
};

@_p.customElement({
  ...$$,
  dependencies: [
    FreeLayoutImpl,
    FreeLayoutAddZone,
    LayoutTemplate,
    TextInput,
  ],
  template,
})
export class FreeLayout extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.setupHandleSetLayout();
  }

  private setupHandleSetLayout(): void {
    this.declareInput($.template._.onSetLayout)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(event => {
          event.setLayout({
            addZoneTag: 'pbd-free-layout-add-zone',
            attr: new Map<string, string>(),
            tag: $freeLayout.tag,
            getZoneAttr,
          });
        });
  }
}

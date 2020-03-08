import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element } from 'persona';
import { of as observableOf } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { $$ as $gridLayout, GridLayout as GridLayoutImpl } from '../../src/layout/grid-layout';
import { $$ as $layoutTemplate, LayoutTemplate } from '../template/layout-template';

import template from './grid-layout.html';


const $ = {
  column: element('column', ElementWithTagType('mk-text-input'), api($textInput.api)),
  row: element('row', ElementWithTagType('mk-text-input'), api($textInput.api)),
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
};

@_p.customElement({
  dependencies: [
    GridLayoutImpl,
    LayoutTemplate,
    TextInput,
  ],
  tag: 'pbd-grid-layout',
  template,
})
export class GridLayout extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleSetLayout();
  }

  private setupHandleSetLayout(): void {
    this.declareInput($.template._.onSetLayout)
        .pipe(
            withLatestFrom(
                this.declareInput($.column._.value),
                this.declareInput($.row._.value),
            ),
            takeUntil(this.onDispose$),
        )
        .subscribe(([event, column, row]) => {
          event.setLayout({
            addZoneRender$: observableOf(null),
            attr: new Map([
              [$gridLayout.api.colCount.attrName, column],
              [$gridLayout.api.rowCount.attrName, row],
            ]),
            tag: $gridLayout.tag,
          });
        });
  }
}

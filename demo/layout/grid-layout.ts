import { elementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { $$ as $gridLayout, GridLayout as GridLayoutImpl } from '../../src/layout/grid-layout';
import { $$ as $layoutTemplate, LayoutTemplate } from '../template/layout-template';

import template from './grid-layout.html';


const $ = {
  column: element('column', elementWithTagType('mk-text-input'), api($textInput.api)),
  row: element('row', elementWithTagType('mk-text-input'), api($textInput.api)),
  template: element(
      'template',
      elementWithTagType('pbd-layout-template'),
      api($layoutTemplate.api),
  ),
};

@_p.customElement({
  dependencies: [
    GridLayoutImpl,
    LayoutTemplate,
    TextInput,
  ],
  tag: 'pbd-grid-layout',
  template,
  api: {},
})
export class GridLayout extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.setupHandleSetLayout());
  }

  private setupHandleSetLayout(): Observable<unknown> {
    return this.declareInput($.template._.onSetLayout)
        .pipe(
            withLatestFrom(
                this.declareInput($.column._.value),
                this.declareInput($.row._.value),
            ),
            tap(([event, column, row]) => {
              if (typeof column !== 'string' || typeof row !== 'string') {
                return;
              }

              event.setLayout({
                addZoneTag: null,
                attr: new Map([
                  [$gridLayout.api.colCount.attrName, column],
                  [$gridLayout.api.rowCount.attrName, row],
                ]),
                tag: $gridLayout.tag,
                getZoneAttr: () => new Map(),
              });
            }),
        );
  }
}

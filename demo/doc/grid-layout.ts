import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { GridLayout as GridLayoutImpl } from '../../src/layout/grid-layout';

import template from './grid-layout.html';
import { $$ as $layoutTemplate, LayoutTemplate } from './layout-template';


const $ = {
  column: element('column', ElementWithTagType('mk-text-input'), api($textInput.api)),
  row: element('row', ElementWithTagType('mk-text-input'), api($textInput.api)),
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', ElementWithTagType('mk-text-input'), api($textInput.api)),
  y: element('y', ElementWithTagType('mk-text-input'), api($textInput.api)),
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
  private readonly column$ = this.declareInput($.column._.value);
  private readonly onAddZone$ = this.declareInput($.template._.onAddZone);
  private readonly row$ = this.declareInput($.row._.value);
  private readonly x$ = this.declareInput($.x._.value);
  private readonly y$ = this.declareInput($.y._.value);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleAddZone();
    this.render($.template._.layoutAttr).withFunction(this.renderLayoutAttr);
  }

  private renderLayoutAttr(): Observable<ReadonlyMap<string, string>> {
    return combineLatest([
      this.column$,
      this.row$,
    ])
    .pipe(
        map(([column, row]) => new Map([['column-count', column], ['row-count', row]])),
    );
  }

  private setupHandleAddZone(): void {
    this.onAddZone$
        .pipe(
            withLatestFrom(
                this.x$,
                this.y$,
            ),
            takeUntil(this.onDispose$),
        )
        .subscribe(([event, x, y]) => {
          event.addZone(new Map([
            ['x', x],
            ['y', y],
          ]));
        });
  }
}

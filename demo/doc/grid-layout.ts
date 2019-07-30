import { createImmutableMap, ImmutableMap } from '@gs-tools/collect';
import { ElementWithTagType } from '@gs-types';
import { $textInput, _p, _v, TextInput, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { map, tap, withLatestFrom } from '@rxjs/operators';

import { GridLayout as GridLayoutImpl } from '../../src/layout/grid-layout';

import template from './grid-layout.html';
import { $$ as $layoutTemplate, LayoutTemplate } from './layout-template';


const $ = {
  column: element('column', ElementWithTagType('mk-text-input'), api($textInput)),
  row: element('row', ElementWithTagType('mk-text-input'), api($textInput)),
  template: element('template', ElementWithTagType('pbd-layout-template'), api($layoutTemplate)),
  x: element('x', ElementWithTagType('mk-text-input'), api($textInput)),
  y: element('y', ElementWithTagType('mk-text-input'), api($textInput)),
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
  private readonly column$ = _p.input($.column._.value, this);
  private readonly onAddDropZone$ = _p.input($.template._.onAddDropZone, this);
  private readonly row$ = _p.input($.row._.value, this);
  private readonly x$ = _p.input($.x._.value, this);
  private readonly y$ = _p.input($.y._.value, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupHandleAddDropZone(),
      _p.render($.template._.layoutAttr).withVine(_v.stream(this.renderLayoutAttr, this)),
    ];
  }

  private renderLayoutAttr(): Observable<ImmutableMap<string, string>> {
    return combineLatest([
      this.column$,
      this.row$,
    ])
    .pipe(
        map(([column, row]) => new Map([['column-count', column], ['row-count', row]])),
        map(map => createImmutableMap(map)),
    );
  }

  private setupHandleAddDropZone(): Observable<unknown> {
    return this.onAddDropZone$.pipe(
        withLatestFrom(
            this.x$,
            this.y$,
        ),
        tap(([event, x, y]) => {
          event.addDropZone(new Map([
            ['x', x],
            ['y', y],
          ]));
        }),
    );
  }
}

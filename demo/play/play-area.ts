import { Vine } from 'grapevine';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { $drawer, _p, Drawer, ThemedCustomElementCtrl } from 'mask';
import { element, mutationObservable, onDom, SimpleElementRenderSpec, single, textContent } from 'persona';
import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, mapTo, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { $playAreaService } from './play-area-service';
import template from './play-area.html';
import { PlayDefault } from './play-default';


const $ = {
  info: element('info', $drawer, {}),
  layoutInfo: element('layoutInfo', instanceofType(HTMLParagraphElement), {
    text: textContent(),
  }),
  main: element('main', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
};

const LAYOUT_ID = 'layout';

@_p.customElement({
  dependencies: [
    PlayDefault,
    Drawer,
  ],
  tag: 'pbd-play-area',
  template,
})
export class PlayArea extends ThemedCustomElementCtrl {
  private readonly onRootMouseOut$ = this.declareInput($.root._.onMouseOut);
  private readonly onRootMouseOver$ = this.declareInput($.root._.onMouseOver);
  private readonly playAreaService$ = $playAreaService.get(this.vine);
  private readonly mainEl$ = this.declareInput($.main);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.main._.content).withFunction(this.renderContent);
    this.setupHandleDropZones();
    this.render($.info._.expanded).withFunction(this.renderInfoExpanded);
    this.render($.layoutInfo._.text).withFunction(this.renderLayoutInfo);
  }

  private renderContent(): Observable<SimpleElementRenderSpec> {
    return this.playAreaService$.pipe(
        switchMap(service => service.layout$),
        distinctUntilChanged((prev, curr) => {
          if (!!prev && !!curr) {
            return prev.tag === curr.tag;
          }

          return prev === curr;
        }),
        map(layoutSpec => {
          if (layoutSpec) {
            return layoutSpec;
          }

          return {
            attr: new Map(),
            tag: 'pbd-play-default',
          };
        }),
        map(spec => new SimpleElementRenderSpec(
          spec.tag,
          new Map([...spec.attr, ['id', LAYOUT_ID]]),
        )),
    );
  }

  private renderInfoExpanded(): Observable<boolean> {
    return merge(
        this.onRootMouseOut$.pipe(mapTo(false)),
        this.onRootMouseOver$.pipe(mapTo(true)),
    )
    .pipe(startWith(false));
  }

  private renderLayoutInfo(): Observable<string> {
    return this.playAreaService$.pipe(
        switchMap(service => service.layout$),
        map(spec => {
          if (!spec) {
            return '';
          }
          const params = [...spec.attr].map(([key, value]) => `${key}: ${value}`).join(', ');
          return `${spec.tag} (${params})`;
        }),
    );
  }

  private setupHandleDropZones(): void {
    this.mainEl$.pipe(
        switchMap(mainEl => {
          return mutationObservable(mainEl, {childList: true}).pipe(
              startWith({}),
              map(() => mainEl.querySelector(`#${LAYOUT_ID}`)),
          );
        }),
        distinctUntilChanged(),
        filterNonNull(),
        switchMap(layoutEl => {
          return this.playAreaService$.pipe(
              switchMap(service => service.dropZones$),
              tap(diff => {
                switch (diff.type) {
                  case 'add':
                    layoutEl.appendChild(createDropZone(diff.value));
                    return;
                  case 'delete':
                    // Can't delete zones. So skip it.
                    return;
                  case 'init':
                    layoutEl.innerHTML = '';
                    for (const spec of diff.value) {
                      layoutEl.appendChild(createDropZone(spec));
                    }
                    return;
                }
              }),
          );
        }),
        takeUntil(this.onDispose$),
    )
    .subscribe();
  }
}

function createDropZone(attrs: Map<string, string>): HTMLElement {
  const el = document.createElement('pb-drop-zone');
  for (const [key, value] of attrs) {
    el.setAttribute(key, value);
  }

  return el;
}

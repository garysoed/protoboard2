import { Vine } from 'grapevine';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { InstanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, mutationObservable, SimpleElementRenderSpec, single } from 'persona';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { $playAreaService } from './play-area-service';
import template from './play-area.html';
import { PlayDefault } from './play-default';


const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

const LAYOUT_ID = 'layout';

@_p.customElement({
  dependencies: [
    PlayDefault,
  ],
  tag: 'pbd-play-area',
  template,
})
export class PlayArea extends ThemedCustomElementCtrl {
  private readonly playAreaService$ = $playAreaService.get(this.vine);
  private readonly rootEl$ = this.declareInput($.root);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.root._.content).withFunction(this.renderContent);
    this.setupHandleDropZones();
  }

  private renderContent(): Observable<SimpleElementRenderSpec> {
    return this.playAreaService$.pipe(
        switchMap(service => service.getLayout()),
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

  private setupHandleDropZones(): void {
    this.rootEl$.pipe(
        switchMap(rootEl => {
          return mutationObservable(rootEl, {childList: true}).pipe(
              startWith({}),
              map(() => rootEl.querySelector(`#${LAYOUT_ID}`)),
          );
        }),
        distinctUntilChanged(),
        filterNonNull(),
        switchMap(layoutEl => {
          return this.playAreaService$.pipe(
              switchMap(service => service.getDropZones()),
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

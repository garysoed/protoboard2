import { debug, filterNonNull } from '@gs-tools/rxjs';
import { InstanceofType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, mutationObservable, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { distinctUntilChanged, map, startWith, switchMap, tap, withLatestFrom } from '@rxjs/operators';

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
  private readonly playAreaService$ = $playAreaService.asSubject();
  private readonly rootEl$ = _p.input($.root, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.root._.content).withVine(_v.stream(this.renderContent, this)),
      () => this.setupHandleDropZones(),
    ];
  }

  private renderContent(): Observable<SingleRenderSpec> {
    return this.playAreaService$.pipe(
        switchMap(service => service.getTag()),
        distinctUntilChanged(),
        map(tag => {
          if (tag) {
            return {tag};
          }

          return {
            tag: 'pbd-play-default',
          };
        }),
        map(spec => ({...spec, attr: new Map([['id', LAYOUT_ID]])})),
        debug('rendering'),
    );
  }

  private setupHandleDropZones(): Observable<unknown> {
    return this.rootEl$.pipe(
        debug('rootEl'),
        switchMap(rootEl => {
          return mutationObservable(rootEl, {childList: true}).pipe(
              startWith({}),
              map(() => rootEl.querySelector(`#${LAYOUT_ID}`)),
          );
        }),
        debug('rootLayout'),
        distinctUntilChanged(),
        filterNonNull(),
        debug('diff'),
        switchMap(layoutEl => {
          return this.playAreaService$.pipe(
              switchMap(service => service.getDropZones()),
              tap(diff => {
                switch (diff.type) {
                  case 'add':
                    layoutEl.appendChild(createDropZone(diff.value));
                    return;
                  case 'delete':
                    throw new Error('Cannot delete drop zones');
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
    );
  }
}

function createDropZone(attrs: Map<string, string>): HTMLElement {
  const el = document.createElement('pb-drop-zone');
  for (const [key, value] of attrs) {
    el.setAttribute(key, value);
  }

  return el;
}

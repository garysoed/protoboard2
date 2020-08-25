import { instanceofType } from 'gs-types';
import { $drawer, _p, Drawer, ThemedCustomElementCtrl } from 'mask';
import { element, onDom, PersonaContext, textContent } from 'persona';
import { of as observableOf } from 'rxjs';

import { Slot } from '../../src/container/slot';
import { Supply } from '../../src/region/supply';
import { $render, Render } from '../../src/state/render';

import template from './play-area.html';


const $ = {
  info: element('info', $drawer, {}),
  layoutInfo: element('layoutInfo', instanceofType(HTMLPreElement), {
    text: textContent(),
  }),
  // main: element('main', $render, {}),
  root: element('root', instanceofType(HTMLDivElement), {
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
};

// const LAYOUT_ID = 'layout';

@_p.customElement({
  dependencies: [
    Render,
    Slot,
    Supply,
  ],
  tag: 'pbd-play-area',
  template,
  api: {},
})
export class PlayArea extends ThemedCustomElementCtrl {
  private readonly onRootMouseOut$ = this.declareInput($.root._.onMouseOut);
  private readonly onRootMouseOver$ = this.declareInput($.root._.onMouseOver);
  // private readonly playAreaService$ = $playAreaService.get(this.vine);
  // private readonly mainEl$ = this.declareInput($.main);

  constructor(context: PersonaContext) {
    super(context);

    // this.addSetup(this.setupHandleZones());
    // this.render($.main._.content, this.renderContent());
    // this.render($.info._.expanded, this.renderInfoExpanded());
    // this.render($.layoutInfo._.text, this.renderLayoutInfo());
  }

  // private renderContent(): Observable<SimpleElementRenderSpec> {
  //   return this.playAreaService$.pipe(
  //       switchMap(service => service.layout$),
  //       distinctUntilChanged((prev, curr) => {
  //         if (!!prev && !!curr) {
  //           return prev.tag === curr.tag;
  //         }

  //         return prev === curr;
  //       }),
  //       map(layoutSpec => {
  //         if (layoutSpec) {
  //           return layoutSpec;
  //         }

  //         return {
  //           attr: new Map(),
  //           tag: 'pbd-play-default',
  //         };
  //       }),
  //       map(spec => new SimpleElementRenderSpec(
  //         spec.tag,
  //         observableOf(new Map([
  //           ...spec.attr,
  //           ['id', LAYOUT_ID],
  //           ['fill-parent', ''],
  //         ])),
  //       )),
  //   );
  // }

  // private renderInfoExpanded(): Observable<boolean> {
  //   return merge(
  //       this.onRootMouseOut$.pipe(mapTo(false)),
  //       this.onRootMouseOver$.pipe(mapTo(true)),
  //   )
  //   .pipe(startWith(false));
  // }

  // private renderLayoutInfo(): Observable<string> {
  //   return this.playAreaService$.pipe(
  //       switchMap(service => service.layout$),
  //       map(spec => {
  //         if (!spec) {
  //           return '';
  //         }
  //         const params = [...spec.attr].map(([key, value]) => `${key}: ${value}`).join(', ');
  //         return `${spec.tag} (${params})`;
  //       }),
  //   );
  // }

  // private setupHandleZones(): Observable<unknown> {
  //   return this.mainEl$.pipe(
  //       switchMap(mainEl => {
  //         return mutationObservable(mainEl, {childList: true}).pipe(
  //             startWith({}),
  //             map(() => mainEl.querySelector(`#${LAYOUT_ID}`)),
  //         );
  //       }),
  //       distinctUntilChanged(),
  //       filterNonNull(),
  //       switchMap(layoutEl => {
  //         return this.playAreaService$.pipe(
  //             switchMap(service => service.zones$),
  //             tap(diff => {
  //               switch (diff.type) {
  //                 case 'add':
  //                   layoutEl.appendChild(createZone(diff.value));
  //                   return;
  //                 case 'delete':
  //                   // Can't delete zones. So skip it.
  //                   return;
  //                 case 'init':
  //                   layoutEl.innerHTML = '';
  //                   for (const spec of diff.value) {
  //                     layoutEl.appendChild(createZone(spec));
  //                   }
  //                   return;
  //               }
  //             }),
  //         );
  //       }),
  //   );
  // }
}

// function createZone({tag, attr}: ZoneSpec): HTMLElement {
//   const el = document.createElement(tag);
//   for (const [key, value] of attr) {
//     el.setAttribute(key, value);
//   }

//   return el;
// }

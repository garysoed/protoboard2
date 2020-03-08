import { Vine } from 'grapevine';
import { ElementWithTagType, InstanceofType } from 'gs-types';
import { $drawer, $svgConfig, $textIconButton, _p, Drawer, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { api, attributeIn, element, innerHtml } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';

import template from './doc-template.html';


export const $$ = {
  tag: 'pbd-doc-template',
  api: {
    label: attributeIn('label', stringParser()),
  },
};

const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), api($drawer.api)),
  drawerIcon: element('drawerIcon', $textIconButton, {}),
  host: element($$.api),
  title: element('title', InstanceofType(HTMLHeadingElement), {
    inner: innerHtml(),
  }),
};

@_p.customElement({
  ...$$,
  configure: vine => {
    const icons = new Map([
      ['chevron_down', chevronDownSvg],
      ['chevron_up', chevronUpSvg],
    ]);
    const svgConfigMap$ = $svgConfig.get(vine);
    for (const [key, content] of icons) {
      svgConfigMap$.next({
        key,
        type: 'set',
        value: {type: 'embed', content},
      });
    }
  },
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  template,
})
export class DocTemplate extends ThemedCustomElementCtrl {
  private readonly drawerExpanded$ = new BehaviorSubject(false);
  private readonly label$ = this.declareInput($.host._.label);
  private readonly onDrawerIconClick$ = this.declareInput($.drawerIcon._.actionEvent);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.drawer._.expanded).withObservable(this.drawerExpanded$);
    this.render($.drawerIcon._.icon).withFunction(this.renderDrawerIcon);
    this.render($.title._.inner).withObservable(this.label$);
    this.setupHandleDrawerIconClick();
  }

  private renderDrawerIcon(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  private setupHandleDrawerIconClick(): void {
    this.onDrawerIconClick$
        .pipe(
            withLatestFrom(this.drawerExpanded$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, expanded]) => this.drawerExpanded$.next(!expanded));
  }
}

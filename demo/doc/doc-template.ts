import { ElementWithTagType, InstanceofType } from '@gs-types';
import { $drawer, $svgConfig, $textIconButton, _p, _v, Drawer, stringParser, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, element, InitFn, innerHtml } from '@persona';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, tap, withLatestFrom } from '@rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';

import template from './doc-template.html';

export const $$ = {
  label: attributeIn('label', stringParser()),
};

const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), api($drawer)),
  drawerIcon: element(
      'drawerIcon',
      ElementWithTagType('mk-text-icon-button'),
      api($textIconButton),
  ),
  host: element($$),
  title: element('title', InstanceofType(HTMLHeadingElement), {
    inner: innerHtml(),
  }),
};

@_p.customElement({
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
  tag: 'pbd-doc-template',
  template,
})
export class DocTemplate extends ThemedCustomElementCtrl {
  private readonly drawerExpanded$ = new BehaviorSubject(false);
  private readonly label$ = _p.input($.host._.label, this);
  private readonly onDrawerIconClick$ = _p.input($.drawerIcon._.actionEvent, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawer._.expanded).withObservable(this.drawerExpanded$),
      _p.render($.drawerIcon._.icon).withVine(_v.stream(this.renderDrawerIcon, this)),
      _p.render($.title._.inner).withObservable(this.label$),
      this.setupHandleDrawerIconClick(),
    ];
  }

  private renderDrawerIcon(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  private setupHandleDrawerIconClick(): InitFn {
    return () => this.onDrawerIconClick$
        .pipe(
            withLatestFrom(this.drawerExpanded$),
            tap(([, expanded]) => this.drawerExpanded$.next(!expanded)),
        );
  }
}

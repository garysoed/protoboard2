import { ElementWithTagType } from '@gs-types';
import { $drawer, $svgConfig, $textIconButton, _p, _v, Drawer, Icon, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, tap, withLatestFrom } from '@rxjs/operators';
import { Piece as PieceComponent } from '../../src/component/piece';
import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';
import meepleSvg from '../asset/meeple.svg';
import template from './piece.html';

const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), api($drawer)),
  drawerIcon: element(
      'drawerIcon',
      ElementWithTagType('mk-text-icon-button'),
      api($textIconButton),
  ),
};

@_p.customElement({
  configure: vine => {
    const icons = new Map([
      ['meeple', meepleSvg],
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
    Icon,
    PieceComponent,
    TextIconButton,
  ],
  tag: 'pbd-piece',
  template,
})
export class Piece extends ThemedCustomElementCtrl {
  private readonly drawerExpanded$ = new BehaviorSubject(false);
  private readonly onDrawerIconClick$ = _p.input($.drawerIcon._.actionEvent, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawer._.expanded).withObservable(this.drawerExpanded$),
      _p.render($.drawerIcon._.icon).withVine(_v.stream(this.renderDrawerIcon, this)),
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

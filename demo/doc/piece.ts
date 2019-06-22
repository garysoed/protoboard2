import { filterNonNull, mapNonNull } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { $drawer, $icon, $svgConfig, $textIconButton, _p, _v, Drawer, Icon, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, mutationObservable, onDom } from '@persona';
import { BehaviorSubject, Observable, of as observableOf } from '@rxjs';
import { filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from '@rxjs/operators';
import { Piece as PieceComponent } from '../../src/component/piece';
import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import template from './piece.html';

const $ = {
  create: element('create', ElementWithTagType('section'), {}),
  customize: element('customize', ElementWithTagType('section'), {
    onClick: onDom('click'),
  }),
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
      ['coin', coinSvg],
      ['gem', gemSvg],
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
  private readonly createEl$ = _p.input($.create, this);
  private readonly drawerExpanded$ = new BehaviorSubject(false);
  private readonly onCustomizeClick$ = _p.input($.customize._.onClick, this);
  private readonly onDrawerIconClick$ = _p.input($.drawerIcon._.actionEvent, this);
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawer._.expanded).withObservable(this.drawerExpanded$),
      _p.render($.drawerIcon._.icon).withVine(_v.stream(this.renderDrawerIcon, this)),
      this.setupHandleCustomizeClick(),
      this.setupHandleDrawerIconClick(),
      this.setupHandleSelectedIcon(),
    ];
  }

  private renderDrawerIcon(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  private setupHandleCustomizeClick(): InitFn {
    return () => this.onCustomizeClick$
        .pipe(
            map(event => event.target),
            mapNonNull(target => {
              if (!(target instanceof Element)) {
                return null;
              }

              if (!target.classList.contains('bigButton')) {
                return null;
              }

              return target.id;
            }),
            filterNonNull(),
            tap(icon => this.selectedIcon$.next(icon)),
        );
  }

  private setupHandleDrawerIconClick(): InitFn {
    return () => this.onDrawerIconClick$
        .pipe(
            withLatestFrom(this.drawerExpanded$),
            tap(([, expanded]) => this.drawerExpanded$.next(!expanded)),
        );
  }

  private setupHandleSelectedIcon(): InitFn {
    return (_vine, root) => this.createEl$
        .pipe(
            switchMap(createEl => mutationObservable(createEl, {childList: true})
                .pipe(
                    mapTo(createEl),
                    startWith(createEl),
                ),
            ),
            map(createEl => createEl.querySelector('pb-piece mk-icon')),
            filter((iconEl): iconEl is HTMLElement => !!iconEl),
            switchMap(iconEl => api($icon).icon
                .resolve(() => observableOf(iconEl))
                .output(root, this.selectedIcon$),
            ),
        );
  }
}

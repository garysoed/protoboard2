import { debug, filterNonNull, mapNonNull } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { $icon, $svgConfig, _p, Icon, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, mutationObservable, onDom } from '@persona';
import { BehaviorSubject, Observable, of as observableOf } from '@rxjs';
import { filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { Piece as PieceImpl } from '../../src/component/piece';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { ComponentTemplate } from './component-template';
import template from './piece.html';


const $ = {
  create: element('create', ElementWithTagType('section'), {}),
  customize: element('customize', ElementWithTagType('section'), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  configure: vine => {
    const icons = new Map([
      ['meeple', meepleSvg],
      ['coin', coinSvg],
      ['gem', gemSvg],
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
    ComponentTemplate,
    Icon,
    PieceImpl,
  ],
  tag: 'pbd-piece',
  template,
})
export class Piece extends ThemedCustomElementCtrl {
  private readonly createEl$ = _p.input($.create, this);
  private readonly onCustomizeClick$ = _p.input($.customize._.onClick, this);
  private readonly pieceEl$ = this.createPieceEl();
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupHandleCustomizeClick(),
      (_vine, root) => this.setupHandleSelectedIcon(root),
      () => this.setupHandlePieceRemoved(),
    ];
  }

  private createPieceEl(): Observable<HTMLElement|null> {
    return this.createEl$.pipe(
        switchMap(createEl => mutationObservable(createEl, {childList: true})
            .pipe(
                mapTo(createEl),
                startWith(createEl),
            ),
        ),
        map(createEl => createEl.querySelector('pb-piece mk-icon')),
    );
  }

  private setupHandleCustomizeClick(): Observable<unknown> {
    return this.onCustomizeClick$
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

  private setupHandlePieceRemoved(): Observable<unknown> {
    return this.pieceEl$
        .pipe(
            filter(piece => piece === null),
            withLatestFrom(this.createEl$),
            tap(([, createEl]) => {
              const pieceEl = document.createElement('pb-piece');
              const iconEl = document.createElement('mk-icon');
              pieceEl.appendChild(iconEl);
              createEl.appendChild(pieceEl);
            }),
        );
  }

  private setupHandleSelectedIcon(root: ShadowRoot): Observable<unknown> {
    return this.pieceEl$
        .pipe(
            filterNonNull(),
            switchMap(iconEl => api($icon).icon
                .resolve(() => observableOf(iconEl))
                .output(root, this.selectedIcon$),
            ),
        );
  }
}

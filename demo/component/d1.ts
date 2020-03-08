import { Vine } from 'grapevine';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { ElementWithTagType } from 'gs-types';
import { $icon, $svgConfig, _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { api, element, mutationObservable, onDom } from 'persona';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { D1 as D1Impl } from '../../src/component/d1';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { ComponentTemplate } from '../template/component-template';

import template from './d1.html';


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
    D1Impl,
  ],
  tag: 'pbd-d1',
  template,
})
export class D1 extends ThemedCustomElementCtrl {
  private readonly createEl$ = this.declareInput($.create);
  private readonly onCustomizeClick$ = this.declareInput($.customize._.onClick);
  private readonly pieceEl$ = this.createPieceEl();
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleCustomizeClick();
    this.setupHandleSelectedIcon();
    this.setupHandlePieceRemoved();
  }

  private createPieceEl(): Observable<HTMLElement|null> {
    return this.createEl$.pipe(
        switchMap(createEl => mutationObservable(createEl, {childList: true})
            .pipe(
                mapTo(createEl),
                startWith(createEl),
            ),
        ),
        map(createEl => createEl.querySelector('pb-d1 mk-icon')),
    );
  }

  private setupHandleCustomizeClick(): void {
    this.onCustomizeClick$
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
            takeUntil(this.onDispose$),
        )
        .subscribe(icon => this.selectedIcon$.next(icon));
  }

  private setupHandlePieceRemoved(): void {
    this.pieceEl$
        .pipe(
            filter(piece => piece === null),
            withLatestFrom(this.createEl$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, createEl]) => {
          const pieceEl = document.createElement('pb-d1');
          const iconEl = document.createElement('mk-icon');
          pieceEl.appendChild(iconEl);
          createEl.appendChild(pieceEl);
        });
  }

  private setupHandleSelectedIcon(): void {
    this.pieceEl$
        .pipe(
            filterNonNull(),
            switchMap(iconEl => api($icon.api).icon
                .resolve(() => observableOf(iconEl))
                .output(this.shadowRoot, this.selectedIcon$),
            ),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }
}

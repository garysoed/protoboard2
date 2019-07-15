import { filterNonNull, mapNonNull } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { $icon, $svgConfig, _p, Icon, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, mutationObservable, onDom } from '@persona';
import { BehaviorSubject, of as observableOf } from '@rxjs';
import { filter, map, mapTo, startWith, switchMap, tap } from '@rxjs/operators';

import { Piece as PieceComponent } from '../../src/component/piece';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { DocTemplate } from './doc-template';
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
    DocTemplate,
    Icon,
    PieceComponent,
  ],
  tag: 'pbd-piece',
  template,
})
export class Piece extends ThemedCustomElementCtrl {
  private readonly createEl$ = _p.input($.create, this);
  private readonly onCustomizeClick$ = _p.input($.customize._.onClick, this);
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleCustomizeClick(),
      this.setupHandleSelectedIcon(),
    ];
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

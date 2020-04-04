import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, $svgConfig, _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { api, element, mutationObservable, onDom, PersonaContext } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { D2 as D2Impl } from '../../src/component/d2';
import cardBack from '../asset/card_back.svg';
import cardFront from '../asset/card_front.svg';
import coinSvg from '../asset/coin.svg';
import coinHeadSvg from '../asset/coin_head.svg';
import { ComponentTemplate } from '../template/component-template';

import template from './d2.html';


const $ = {
  create: element('create', elementWithTagType('section'), {}),
  customize: element('customize', elementWithTagType('section'), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  configure: vine => {
    const icons = new Map([
      ['coin-0', coinHeadSvg],
      ['coin-1', coinSvg],
      ['card-0', cardBack],
      ['card-1', cardFront],
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
    D2Impl,
  ],
  tag: 'pbd-d2',
  template,
})
export class D2 extends ThemedCustomElementCtrl {
  private readonly createEl$ = this.declareInput($.create);
  private readonly onCustomizeClick$ = this.declareInput($.customize._.onClick);
  private readonly selectedIcon$ = this.createSelectedIcon();

  constructor(context: PersonaContext) {
    super(context);
    this.setupHandleSelectedIcon('0');
    this.setupHandleSelectedIcon('1');
    this.setupHandlePieceRemoved();
  }

  @cache()
  private createCreateSectionEl(): Observable<HTMLElement> {
    return this.createEl$.pipe(
        switchMap(createEl => mutationObservable(createEl, {childList: true})
            .pipe(
                mapTo(createEl),
                startWith(createEl),
            ),
        ),
    );
  }

  private createFaceEl(suffix: string): Observable<HTMLElement|null> {
    return this.createCreateSectionEl().pipe(
        map(el => el.querySelector(`pb-d2 [slot="face-${suffix}"]`)),
        // debug<HTMLElement|null>(`face-${suffix}`),
    );
  }

  private createSelectedIcon(): Observable<string> {
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
            startWith('card'),
            filterNonNull(),
            takeUntil(this.onDispose$),
        );
  }

  private setupHandlePieceRemoved(): void {
    this.createCreateSectionEl()
        .pipe(
            map(el => el.querySelector('pb-d2')),
            filter(piece => piece === null),
            withLatestFrom(this.createEl$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, createEl]) => {
          const pieceEl = document.createElement('pb-d2');
          const face0El = createFaceEl('0');
          const face1El = createFaceEl('1');
          pieceEl.appendChild(face0El);
          pieceEl.appendChild(face1El);
          createEl.appendChild(pieceEl);
        });
  }

  private setupHandleSelectedIcon(suffix: string): void {
    this.createFaceEl(suffix)
        .pipe(
            filterNonNull(),
            switchMap(faceEl => {
              const output = api($icon.api).icon.resolve(() => observableOf(faceEl));
              return this.selectedIcon$
                  .pipe(
                      map(icon => `${icon}-${suffix}`),
                      output.output(this.shadowRoot),
                  );
            }),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }
}

function createFaceEl(suffix: string): HTMLElement {
  const faceEl = document.createElement('mk-icon');
  faceEl.setAttribute('slot', `face-${suffix}`);
  return faceEl;
}

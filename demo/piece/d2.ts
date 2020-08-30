import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { api, element, mutationObservable, onDom, PersonaContext } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { D2 as D2Impl } from '../../src/piece/d2';
import cardBack from '../asset/card_back.svg';
import cardFront from '../asset/card_front.svg';
import coinSvg from '../asset/coin.svg';
import coinHeadSvg from '../asset/coin_head.svg';
import { PieceTemplate } from '../template/piece-template';

import template from './d2.html';


export const $d2Demo = {
  tag: 'pbd-d2',
  api: {},
};

const $ = {
  create: element('create', elementWithTagType('section'), {}),
  customize: element('customize', elementWithTagType('section'), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$d2Demo,
  configure: vine => {
    registerSvg(vine, 'coin-0', {type: 'embed', content: coinHeadSvg});
    registerSvg(vine, 'coin-1', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'card-0', {type: 'embed', content: cardBack});
    registerSvg(vine, 'card-1', {type: 'embed', content: cardFront});
  },
  dependencies: [
    PieceTemplate,
    Icon,
    D2Impl,
  ],
  template,
})
export class D2Demo extends ThemedCustomElementCtrl {
  private readonly createEl$ = this.declareInput($.create);
  private readonly onCustomizeClick$ = this.declareInput($.customize._.onClick);
  private readonly selectedIcon$ = this.createSelectedIcon();

  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.setupHandleSelectedIcon('0'));
    this.addSetup(this.setupHandleSelectedIcon('1'));
    this.addSetup(this.setupHandlePieceRemoved());
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
        );
  }

  private setupHandlePieceRemoved(): Observable<unknown> {
    return this.createCreateSectionEl()
        .pipe(
            map(el => el.querySelector('pb-d2')),
            filter(piece => piece === null),
            withLatestFrom(this.createEl$),
            tap(([, createEl]) => {
              const pieceEl = document.createElement('pb-d2');
              const face0El = createFaceEl('0');
              const face1El = createFaceEl('1');
              pieceEl.appendChild(face0El);
              pieceEl.appendChild(face1El);
              createEl.appendChild(pieceEl);
            }),
        );
  }

  private setupHandleSelectedIcon(suffix: string): Observable<unknown> {
    return this.createFaceEl(suffix)
        .pipe(
            filterNonNull(),
            switchMap(faceEl => {
              const output = api($icon.api).icon.resolve(() => observableOf(faceEl));
              return this.selectedIcon$
                  .pipe(
                      map(icon => `${icon}-${suffix}`),
                      output.output(this.context),
                  );
            }),
        );
  }
}

function createFaceEl(suffix: string): HTMLElement {
  const faceEl = document.createElement('mk-icon');
  faceEl.setAttribute('slot', `face-${suffix}`);
  return faceEl;
}

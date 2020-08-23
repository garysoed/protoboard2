import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { api, element, mutationObservable, onDom, PersonaContext } from 'persona';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { D1 as D1Impl } from '../../src/piece/d1';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { ComponentTemplate } from '../template/component-template';

import template from './d1.html';


export const $d1 = {
  tag: 'pbd-d1',
  api: {},
};

const $ = {
  create: element('create', elementWithTagType('section'), {}),
  customize: element('customize', elementWithTagType('section'), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$d1,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});
  },
  dependencies: [
    ComponentTemplate,
    Icon,
    D1Impl,
  ],
  template,
})
export class D1 extends ThemedCustomElementCtrl {
  private readonly createEl$ = this.declareInput($.create);
  private readonly pieceEl$ = this.createPieceEl();
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnCustomizeClick$);
    this.addSetup(this.handleSelectedIcon$);
    this.addSetup(this.handlePieceRemoved$);
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

  @cache()
  private get handleOnCustomizeClick$(): Observable<unknown> {
    return this.declareInput($.customize._.onClick)
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

  @cache()
  private get handlePieceRemoved$(): Observable<unknown> {
    return this.pieceEl$
        .pipe(
            filter(piece => piece === null),
            withLatestFrom(this.createEl$),
            tap(([, createEl]) => {
              const pieceEl = document.createElement('pb-d1');
              const iconEl = document.createElement('mk-icon');
              pieceEl.appendChild(iconEl);
              createEl.appendChild(pieceEl);
            }),
        );
  }

  @cache()
  private get handleSelectedIcon$(): Observable<unknown> {
    return this.pieceEl$
        .pipe(
            filterNonNull(),
            switchMap(iconEl => {
              const output = api($icon.api).icon.resolve(() => observableOf(iconEl));
              return this.selectedIcon$.pipe(output.output(this.context));
            }),
        );
  }
}

import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { api, element, mutationObservable, onDom, PersonaContext } from 'persona';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { D1 as D1Impl } from '../../src/component/d1';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { ComponentTemplate } from '../template/component-template';

import template from './d1.html';


const $ = {
  create: element('create', elementWithTagType('section'), {}),
  customize: element('customize', elementWithTagType('section'), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
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
  tag: 'pbd-d1',
  template,
  api: {},
})
export class D1 extends ThemedCustomElementCtrl {
  private readonly createEl$ = this.declareInput($.create);
  private readonly onCustomizeClick$ = this.declareInput($.customize._.onClick);
  private readonly pieceEl$ = this.createPieceEl();
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.setupHandleCustomizeClick());
    this.addSetup(this.setupHandleSelectedIcon());
    this.addSetup(this.setupHandlePieceRemoved());
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
              const pieceEl = document.createElement('pb-d1');
              const iconEl = document.createElement('mk-icon');
              pieceEl.appendChild(iconEl);
              createEl.appendChild(pieceEl);
            }),
        );
  }

  private setupHandleSelectedIcon(): Observable<unknown> {
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

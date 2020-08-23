import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { element, onDom, PersonaContext, renderCustomElement } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { $d1 as $d1Impl, D1 as D1Impl } from '../../src/piece/d1';
import { registerStateHandler } from '../../src/state/register-state-handler';
import { addObject } from '../../src/state/state-service';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

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
  previewIcon: element('previewIcon', $icon, {}),
  template: element('template', $pieceTemplate, {}),
};

const D1_PREVIEW_TYPE = 'preview-d1';

@_p.customElement({
  ...$d1,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});

    registerStateHandler(
        D1_PREVIEW_TYPE,
        (state, context) => {
          const icon$ = renderCustomElement(
              $icon,
              {inputs: {icon: state.payload.get('icon')}},
              context,
          );
          return renderCustomElement(
              $d1Impl,
              {children: icon$.pipe(map(el => [el]))},
              context,
          );
        },
        vine,
    );
  },
  dependencies: [
    PieceTemplate,
    Icon,
    D1Impl,
  ],
  template,
})
export class D1 extends ThemedCustomElementCtrl {
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnCustomizeClick$);
    this.render($.previewIcon._.icon, this.selectedIcon$);
    this.addSetup(this.handleOnPieceAdd$);
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
  private get handleOnPieceAdd$(): Observable<unknown> {
    return this.declareInput($.template._.onAdd).pipe(
        withLatestFrom(this.selectedIcon$),
        tap(([, icon]) => {
          addObject({type: D1_PREVIEW_TYPE, id: '1', payload: {icon}}, this.vine);
        }),
    );
  }
}

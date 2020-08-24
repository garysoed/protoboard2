import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { element, onDom, PersonaContext, renderCustomElement } from 'persona';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { $d1 as $d1Impl, D1 as D1Impl } from '../../src/piece/d1';
import { ACTIVE_ID } from '../../src/region/active';
import { SUPPLY_ID } from '../../src/region/supply';
import { registerStateHandler } from '../../src/state/register-state-handler';
import { $stateService, setStates } from '../../src/state/state-service';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { $generateObjectId } from '../core/generate-object-id';
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

interface D1PreviewPayload {
  readonly icon: string;
}

@_p.customElement({
  ...$d1,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});

    registerStateHandler<D1PreviewPayload>(
        D1_PREVIEW_TYPE,
        (state, context) => {
          const icon$ = renderCustomElement(
              $icon,
              {inputs: {icon: state.payload.icon}},
              context,
          );
          return renderCustomElement(
              $d1Impl,
              {
                children: icon$.pipe(map(el => [el])),
                inputs: {objectId: observableOf(state.id)},
              },
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
    const currentState$ = $stateService.get(this.vine).pipe(
        switchMap(service => service.currentState$),
    );
    return this.declareInput($.template._.onAdd).pipe(
        withLatestFrom(this.selectedIcon$, currentState$, $generateObjectId.get(this.vine)),
        tap(([, icon, currentState, generateObjectId]) => {
          const id = generateObjectId();
          const supplyState = currentState.get(SUPPLY_ID);
          const supplyIds = supplyState?.payload.objectIds;
          const activeState = currentState.get(ACTIVE_ID);
          const activeIds = activeState?.payload.objectIds;
          if (!(supplyIds instanceof Array) ||
              !supplyState ||
              !activeState ||
              !(activeIds instanceof Array)) {
            throw new Error('supplyIds or activeIds cannot be found');
          }

          setStates(
              [
                ...currentState.values(),
                {...activeState, payload: {objectIds: []}},
                {type: D1_PREVIEW_TYPE, id, payload: {icon}},
                {...supplyState, payload: {objectIds: [...supplyIds, id]}},
              ],
              this.vine,
          );
        }),
    );
  }
}

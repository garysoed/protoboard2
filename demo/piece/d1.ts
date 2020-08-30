import { cache } from 'gs-tools/export/data';
import { elementWithTagType } from 'gs-types';
import { $icon, _p, Icon, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext, renderCustomElement } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { $d1 as $d1Impl, D1Payload, D1Payload as D1Impl } from '../../src/piece/d1';
import { SUPPLY_ID } from '../../src/region/supply';
import { registerStateHandler } from '../../src/state/state-service';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { $stagingService } from '../core/staging-service';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d1.html';


export const $d1 = {
  tag: 'pbd-d1',
  api: {},
};

const $ = {
  create: element('create', elementWithTagType('section'), {}),
  template: element('template', $pieceTemplate, {}),
};

const D1_PREVIEW_TYPE = 'preview-d1';

interface D1PreviewPayload extends D1Payload {
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
  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnPieceAdd$);
  }

  @cache()
  private get handleOnPieceAdd$(): Observable<unknown> {
    return this.declareInput($.template._.onAdd).pipe(
        withLatestFrom($stagingService.get(this.vine)),
        switchMap(([{faceIcons}, stagingService]) => {
          return stagingService.addState(
              D1_PREVIEW_TYPE,
              {
                icon: faceIcons[0],
                parentId: SUPPLY_ID,
              },
          );
        }),
    );
  }
}

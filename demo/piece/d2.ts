import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D2, D2Spec, d2Spec, Lens, Slot, slotSpec, SlotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d2.html';
import {renderPiece} from './render-piece';


interface State {
  readonly cardSlot: SlotSpec;
  readonly coinSlot: SlotSpec;
}

const $cardId = rootStateIdSource<D2Spec>(() => d2Spec({}));
const $cardPath = immutablePathSource($cardId);
const $coinId = rootStateIdSource<D2Spec>(() => d2Spec({}));
const $coinPath = immutablePathSource($coinId);

const $stateId = rootStateIdSource<State>(vine => ({
  cardSlot: slotSpec({contentsId: mutableState([$cardPath.get(vine)])}),
  coinSlot: slotSpec({contentsId: mutableState([$coinPath.get(vine)])}),
}));

const $cardSlotPath = immutablePathSource($stateId, state => state._('cardSlot'));
const $coinSlotPath = immutablePathSource($stateId, state => state._('coinSlot'));


export const $d2Demo = {
  tag: 'pbd-d2',
  api: {},
};

const $ = {
  cardSlot: element('cardSlot', $slot, {}),
  coinSlot: element('coinSlot', $slot, {}),
};

@_p.customElement({
  ...$d2Demo,
  configure: vine => {
    const cardPath = $cardPath.get(vine);
    const coinPath = $coinPath.get(vine);
    const registerRenderObject = $registerRenderObject.get(vine);
    registerRenderObject(
        cardPath,
        renderPiece([FaceType.CARD_BACK, FaceType.CARD_FRONT], cardPath),
    );

    registerRenderObject(
        coinPath,
        renderPiece([FaceType.COIN_FRONT, FaceType.COIN_BACK], coinPath),
    );
  },
  dependencies: [
    D2,
    DocumentationTemplate,
    Icon,
    Lens,
    RenderedFace,
    Slot,
  ],
  template,
})
export class D2Demo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.cardSlot.objectPath(of($cardSlotPath.get(this.vine))),
      this.renderers.coinSlot.objectPath(of($coinSlotPath.get(this.vine))),
    ];
  }
}

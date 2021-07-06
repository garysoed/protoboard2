import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D2, D2Spec, d2Spec, Lens, Slot, slotSpec, SlotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d2.html';
import {renderPiece} from './render-piece';


interface State {
  readonly cardSlot: StateId<SlotSpec>;
  readonly coinSlot: StateId<SlotSpec>;
}

const $$card = source<StateId<D2Spec>>(vine => $stateService.get(vine).modify(x => x.add(d2Spec({}, x))));

const $$coin = source<StateId<D2Spec>>(vine => $stateService.get(vine).modify(x => x.add(d2Spec({}, x))));


const $state = source<State>(vine => $stateService.get(vine).modify(x => ({
  cardSlot: x.add(slotSpec(
      {contentsId: x.add([$$card.get(vine)])},
      x,
  )),
  coinSlot: x.add(slotSpec(
      {contentsId: x.add([$$coin.get(vine)])},
      x,
  )),
})));

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
    const $card = $$card.get(vine);
    const $coin = $$coin.get(vine);
    const registerRenderObject = $registerRenderObject.get(vine);
    registerRenderObject(
        $card,
        renderPiece([FaceType.CARD_BACK, FaceType.CARD_FRONT], $card),
    );

    registerRenderObject(
        $coin,
        renderPiece([FaceType.COIN_FRONT, FaceType.COIN_BACK], $coin),
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
    const state = $state.get(this.context.vine);
    return [
      this.renderers.cardSlot.objectId(of(state.cardSlot)),
      this.renderers.coinSlot.objectId(of(state.coinSlot)),
    ];
  }
}

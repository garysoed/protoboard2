import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D6, d6Spec, D6Spec, Lens, Slot, slotSpec, SlotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d6.html';
import {renderPiece} from './render-piece';


interface State {
  readonly diceSlot: SlotSpec;
}

const $diceId = rootStateIdSource<D6Spec>(() => d6Spec({}));
const $dicePath = immutablePathSource($diceId);

const $stateId = rootStateIdSource<State>(vine => ({
  diceSlot: slotSpec({contentsId: mutableState([$dicePath.get(vine)])}),
}));
const $diceSlotPath = immutablePathSource($stateId, state => state._('diceSlot'));

export const $d6Demo = {
  tag: 'pbd-d6',
  api: {},
};

const $ = {
  diceSlot: element('diceSlot', $slot, {}),
};

@_p.customElement({
  ...$d6Demo,
  configure: vine => {
    const registerRenderObject = $registerRenderObject.get(vine);
    const dicePath = $dicePath.get(vine);
    registerRenderObject(
        dicePath,
        renderPiece(
            [
              FaceType.DICE_PIP_1,
              FaceType.DICE_PIP_2,
              FaceType.DICE_PIP_3,
              FaceType.DICE_PIP_4,
              FaceType.DICE_PIP_4,
              FaceType.DICE_PIP_5,
            ],
            dicePath,
        ),
    );
  },
  dependencies: [
    D6,
    DocumentationTemplate,
    Icon,
    Lens,
    RenderedFace,
    Slot,
  ],
  template,
})
export class D6Demo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.diceSlot.objectPath(of($diceSlotPath.get(this.context.vine))),
    ];
  }
}

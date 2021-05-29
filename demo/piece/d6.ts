import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D6, d6Spec, D6Spec, indexedContentSpecs, Lens, Slot, slotSpec, SlotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d6.html';
import {renderPiece} from './render-piece';


interface State {
  readonly diceSlot: StateId<SlotSpec>;
}

const $$dice = source<StateId<D6Spec>>(
    '$dice',
    vine => $stateService.get(vine).modify(x => x.add(d6Spec({}, x))),
);

const $state = source<State>('d6state', vine => $stateService.get(vine).modify(x => ({
  diceSlot: x.add(slotSpec({$contentSpecs: x.add(indexedContentSpecs([$$dice.get(vine)]))})),
})));

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
    const $dice = $$dice.get(vine);
    registerRenderObject(
        $dice,
        renderPiece(
            [
              FaceType.DICE_PIP_1,
              FaceType.DICE_PIP_2,
              FaceType.DICE_PIP_3,
              FaceType.DICE_PIP_4,
              FaceType.DICE_PIP_4,
              FaceType.DICE_PIP_5,
            ],
            $dice,
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
      this.renderers.diceSlot.objectId(of($state.get(this.context.vine).diceSlot)),
    ];
  }
}

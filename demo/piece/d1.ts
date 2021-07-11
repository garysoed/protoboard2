import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D1, d1Spec, Lens, Slot, slotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d1.html';
import {renderPiece} from './render-piece';


const $meepleId = rootStateIdSource(() => d1Spec({}));
const $meeplePath = immutablePathSource($meepleId);
const $gemId = rootStateIdSource(() => d1Spec({}));
const $gemPath = immutablePathSource($gemId);

const $stateId = rootStateIdSource(vine => ({
  meepleSlot: slotSpec(
      {contentsId: mutableState([$meeplePath.get(vine)])},
  ),
  gemSlot: slotSpec(
      {contentsId: mutableState([$gemPath.get(vine)])},
  ),
}));
const $gemSlotPath = immutablePathSource($stateId, state => state._('gemSlot'));
const $meepleSlotPath = immutablePathSource($stateId, state => state._('meepleSlot'));


export const $d1Demo = {
  tag: 'pbd-d1',
  api: {},
};

const $ = {
  gemSlot: element('gemSlot', $slot, {}),
  meepleSlot: element('meepleSlot', $slot, {}),
};

@_p.customElement({
  ...$d1Demo,
  configure: vine => {
    const registerRenderObject = $registerRenderObject.get(vine);
    const $meeple = $meeplePath.get(vine);
    const $gem = $gemPath.get(vine);
    registerRenderObject($meeple, renderPiece([FaceType.MEEPLE], $meeple));
    registerRenderObject($gem, renderPiece([FaceType.GEM], $gem));
  },
  dependencies: [
    D1,
    DocumentationTemplate,
    Icon,
    Lens,
    RenderedFace,
    Slot,
  ],
  template,
})
export class D1Demo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.gemSlot.objectPath(of($gemSlotPath.get(this.context.vine))),
      this.renderers.meepleSlot.objectPath(of($meepleSlotPath.get(this.context.vine))),
    ];
  }
}

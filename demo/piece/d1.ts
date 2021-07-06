import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$registerRenderObject, $slot, D1, d1Spec, Lens, Slot, slotSpec, SlotSpec} from '../../export';
import {FaceType, RenderedFace} from '../core/rendered-face';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './d1.html';
import {renderPiece} from './render-piece';


interface State {
  readonly meepleSlot: StateId<SlotSpec>;
  readonly gemSlot: StateId<SlotSpec>;
}

const $$meeple = source(vine => $stateService.get(vine).modify(x => x.add(d1Spec({}, x))));

const $$gem = source(vine => $stateService.get(vine).modify(x => x.add(d1Spec({}, x))));

const $state = source<State>(vine => $stateService.get(vine).modify(x => ({
  meepleSlot: x.add(slotSpec(
      {contentsId: x.add([$$meeple.get(vine)])},
      x,
  )),
  gemSlot: x.add(slotSpec(
      {contentsId: x.add([$$gem.get(vine)])},
      x,
  )),
})));


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
    const $meeple = $$meeple.get(vine);
    const $gem = $$gem.get(vine);
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
      this.renderers.gemSlot.objectId(of($state.get(this.context.vine).gemSlot)),
      this.renderers.meepleSlot.objectId(of($state.get(this.context.vine).meepleSlot)),
    ];
  }
}

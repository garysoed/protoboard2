import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$slot, slotSpec, SlotSpec} from '../../export';
import {indexedContentSpec} from '../../src/payload/is-container';
import {D1, d1Spec} from '../../src/piece/d1';
import {PieceTemplate} from '../template/piece-template';

import template from './d1.html';


enum DemoPieceType {
  MEEPLE,
  GEM,
}

const D1DEMO_TYPE = 'd1demo';

interface State {
  readonly meepleSlot: StateId<SlotSpec>;
  readonly gemSlot: StateId<SlotSpec>;
}

const $state = source<State>('d1State', vine => $stateService.get(vine).modify(x => ({
  meepleSlot: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([
    indexedContentSpec({
      objectId: x.add(d1Spec({type: D1DEMO_TYPE, payload: {type: DemoPieceType.MEEPLE}, $rotationDeg: x.add(0)})),
      coordinate: {index: 0},
    }),
  ])})),
  gemSlot: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([
    indexedContentSpec({
      objectId: x.add(d1Spec({type: D1DEMO_TYPE, payload: {type: DemoPieceType.GEM}, $rotationDeg: x.add(0)})),
      coordinate: {index: 0},
    }),
  ])})),
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
  dependencies: [
    PieceTemplate,
    Icon,
    D1,
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

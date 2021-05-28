import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, Icon, _p} from 'mask';
import {element, PersonaContext, renderCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {$slot, slotSpec, SlotSpec} from '../../export';
import {$registerRenderObject, RenderObjectFn} from '../../src/objects/render-object-spec';
import {indexedContentSpec} from '../../src/payload/is-container';
import {$d1, D1, d1Spec} from '../../src/piece/d1';
import {$renderedFace, FaceType, RenderedFace} from '../core/rendered-face';
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

const $$meeple = source('$meeple', vine => $stateService.get(vine).modify(x => x.add(
    d1Spec(
        {
          type: D1DEMO_TYPE,
          payload: {type: DemoPieceType.MEEPLE},
        },
        x,
    )),
));

const $$gem = source('$gem', vine => $stateService.get(vine).modify(x => x.add(
    d1Spec(
        {
          type: D1DEMO_TYPE,
          payload: {type: DemoPieceType.GEM},
        },
        x,
    )),
));

function renderD1Demo(iconName: FaceType, objectId: StateId<unknown>): RenderObjectFn {
  return () => {
    const iconContainer$ = renderCustomElement({
      spec: $renderedFace,
      id: objectId.id,
      attrs: new Map([['slot', 'face-0']]),
      inputs: {
        faceType: iconName,
      },
    });

    return of(renderCustomElement({
      spec: $d1,
      inputs: {objectId},
      id: objectId.id,
      children: [iconContainer$],
    }));
  };
}

const $state = source<State>('d1State', vine => $stateService.get(vine).modify(x => ({
  meepleSlot: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([
    indexedContentSpec({
      objectId: $$meeple.get(vine),
      coordinate: {index: 0},
    }),
  ])})),
  gemSlot: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([
    indexedContentSpec({
      objectId: $$gem.get(vine),
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
  configure: vine => {
    const registerRenderObject = $registerRenderObject.get(vine);
    const $meeple = $$meeple.get(vine);
    const $gem = $$gem.get(vine);
    registerRenderObject($meeple, renderD1Demo(FaceType.MEEPLE, $meeple));
    registerRenderObject($gem, renderD1Demo(FaceType.GEM, $gem));
  },
  dependencies: [
    D1,
    Icon,
    PieceTemplate,
    RenderedFace,
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

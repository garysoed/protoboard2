import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {intersectType} from 'gs-types';
import {Context, DIV, iattr, icall, itarget, ivalue, ocase, ostyle, query, registerCustomElement} from 'persona';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {pickAction} from '../action/pick-action';
import {rollAction} from '../action/roll-action';
import {DEFAULT_ROTATE_CONFIG, rotateAction, ROTATE_CONFIG_TYPE} from '../action/rotate-action';
import {turnAction} from '../action/turn-action';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {LENS} from '../face/lens';
import {componentId} from '../id/component-id';
import {renderFace} from '../render/render-face';
import {renderRotatable} from '../render/render-rotatable';
import {ComponentState, COMPONENT_STATE_TYPE} from '../types/component-state';
import {FaceSpec, IsMultifaced, IS_MULTIFACED_TYPE} from '../types/is-multifaced';
import {IsRotatable, IS_ROTATABLE_TYPE} from '../types/is-rotatable';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './d6.html';


export interface D6State extends ComponentState, IsRotatable, IsMultifaced { }

const D6_STATE_TYPE = intersectType([
  COMPONENT_STATE_TYPE,
  IS_ROTATABLE_TYPE,
  IS_MULTIFACED_TYPE,
]);

type Faces = readonly [
  FaceSpec,
  FaceSpec,
  FaceSpec,
  FaceSpec,
  FaceSpec,
  FaceSpec,
];

interface D6StateInput extends Partial<D6State> {
  readonly label?: string;
  readonly faces: Faces;
}

export function d6State(partial: D6StateInput): D6State {
  return {
    id: componentId(partial.label),
    currentFaceIndex: new BehaviorSubject(0),
    rotationDeg: new BehaviorSubject(0),
    ...partial,
  };
}

const $d6 = {
  host: {
    ...create$baseComponent<D6State>(D6_STATE_TYPE).host,
    height: iattr('height'),
    flip: icall('flip', []),
    flipConfig: ivalue('flipConfig', TRIGGER_SPEC_TYPE, () => ({type: TriggerType.F})),
    pick: icall('pick', []),
    pickConfig: ivalue('pickConfig', TRIGGER_SPEC_TYPE, () => ({type: TriggerType.CLICK})),
    roll: icall('roll', []),
    rollConfig: ivalue('rollConfig', TRIGGER_SPEC_TYPE, () => ({type: TriggerType.L})),
    rotate: icall('rotate', []),
    rotateConfig: ivalue(
        'rotateConfig',
        intersectType([TRIGGER_SPEC_TYPE, ROTATE_CONFIG_TYPE]),
        () => ({...DEFAULT_ROTATE_CONFIG, type: TriggerType.R}),
    ),
    turn: icall('turn', []),
    turnConfig: ivalue('turnConfig', TRIGGER_SPEC_TYPE, () => ({type: TriggerType.T})),
    width: iattr('width'),
  },
  shadow: {
    container: query('#container', DIV, {
      height: ostyle('height'),
      face: ocase<FaceSpec>(),
      target: itarget(),
      transform: ostyle('transform'),
      width: ostyle('width'),
    }),
  },
};

class D6Ctrl extends BaseComponent<D6State> {
  constructor(private readonly $: Context<typeof $d6>) {
    super($, 'D6');
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$.host.height.pipe(mapNullableTo(''), this.$.shadow.container.height()),
      this.$.host.width.pipe(mapNullableTo(''), this.$.shadow.container.width()),
      this.installAction(
          turnAction,
          'Flip',
          this.$.shadow.container.target,
          this.$.host.flipConfig.pipe(map(triggerConfig => ({...triggerConfig, step: 3}))),
          this.$.host.flip,
      ),
      this.installAction(
          pickAction,
          'Pick',
          this.$.shadow.container.target,
          this.$.host.pickConfig,
          this.$.host.pick,
      ),
      this.installAction(
          rollAction,
          'Roll',
          this.$.shadow.container.target,
          this.$.host.rollConfig,
          this.$.host.roll,
      ),
      this.installAction(
          rotateAction,
          'Rotate',
          this.$.shadow.container.target,
          this.$.host.rotateConfig,
          this.$.host.rotate,
      ),
      this.installAction(
          turnAction,
          'Turn',
          this.$.shadow.container.target,
          this.$.host.turnConfig.pipe(map(triggerConfig => ({...triggerConfig, step: 1}))),
          this.$.host.turn,
      ),
      this.state.$('rotationDeg').pipe(
          renderRotatable(),
          this.$.shadow.container.transform(),
      ),
      combineLatest([
        this.state.$('currentFaceIndex'),
        this.state._('faces'),
      ])
          .pipe(
              map(([currentFaceIndex, faces]) => faces[currentFaceIndex]),
              this.$.shadow.container.face(renderFace()),
          ),
    ];
  }
}

export const D6 = registerCustomElement({
  ctrl: D6Ctrl,
  deps: [LENS],
  spec: $d6,
  tag: 'pb-d6',
  template,
});

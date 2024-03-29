import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {intersectType, Type} from 'gs-types';
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

import template from './d1.html';


export interface D2State extends ComponentState, IsRotatable, IsMultifaced { }

export const D2_STATE_TYPE: Type<D2State> = intersectType([
  COMPONENT_STATE_TYPE,
  IS_ROTATABLE_TYPE,
  IS_MULTIFACED_TYPE,
]);


interface D2StateInput extends Partial<D2State> {
  readonly label?: string;
  readonly faces: readonly [FaceSpec, FaceSpec];
}

export function d2State(partial: D2StateInput): D2State {
  return {
    id: componentId(partial.label),
    currentFaceIndex: new BehaviorSubject(0),
    rotationDeg: new BehaviorSubject(0),
    ...partial,
  };
}

const $d2 = {
  host: {
    ...create$baseComponent<D2State>(D2_STATE_TYPE).host,
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

class D2Ctrl extends BaseComponent<D2State> {
  /**
   * @internal
   */
  constructor(private readonly $: Context<typeof $d2>) {
    super($, 'D2');
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
          this.$.host.flipConfig.pipe(map(triggerConfig => ({...triggerConfig, step: 1}))),
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

export const D2 = registerCustomElement({
  ctrl: D2Ctrl,
  deps: [LENS],
  spec: $d2,
  tag: 'pb-d2',
  template,
});
import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {mutableState} from 'gs-tools/export/state';
import {intersectType, undefinedType, unknownType} from 'gs-types';
import {Context, DIV, iattr, icall, query, itarget, ivalue, ocase, ostyle, registerCustomElement} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {pickAction} from '../action/pick-action';
import {rollAction} from '../action/roll-action';
import {DEFAULT_ROTATE_CONFIG, rotateAction, ROTATE_CONFIG_TYPE} from '../action/rotate-action';
import {turnAction} from '../action/turn-action';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {renderFace} from '../render/render-face';
import {renderRotatable} from '../render/render-rotatable';
import {ComponentState} from '../types/component-state';
import {IsMultifaced} from '../types/is-multifaced';
import {IsRotatable} from '../types/is-rotatable';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './d6.html';


export interface D6State extends ComponentState, IsRotatable, IsMultifaced { }

type Faces = readonly [unknown, unknown, unknown, unknown, unknown, unknown];

export function d6State(id: {}, faces: Faces, partial: Partial<D6State> = {}): D6State {
  return {
    id,
    currentFaceIndex: mutableState(0),
    faces,
    rotationDeg: mutableState(0),
    ...partial,
  };
}

const $d6 = {
  host: {
    ...create$baseComponent<D6State>().host,
    height: iattr('height'),
    flip: icall('flip', undefinedType),
    flipConfig: ivalue('flipConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.F}),
    pick: icall('pick', undefinedType),
    pickConfig: ivalue('pickConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK}),
    roll: icall('roll', undefinedType),
    rollConfig: ivalue('rollConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.L}),
    rotate: icall('rotate', undefinedType),
    rotateConfig: ivalue(
        'rotateConfig',
        intersectType([TRIGGER_SPEC_TYPE, ROTATE_CONFIG_TYPE]),
        {...DEFAULT_ROTATE_CONFIG, type: TriggerType.R},
    ),
    turn: icall('turn', undefinedType),
    turnConfig: ivalue('turnConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.T}),
    width: iattr('width'),
  },
  shadow: {
    container: query('#container', DIV, {
      height: ostyle('height'),
      face: ocase(unknownType),
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
              this.$.shadow.container.face(faceId => renderFace(this.$.vine, faceId)),
          ),
    ];
  }
}

export const D6 = registerCustomElement({
  ctrl: D6Ctrl,
  spec: $d6,
  tag: 'pb-d6',
  template,
});

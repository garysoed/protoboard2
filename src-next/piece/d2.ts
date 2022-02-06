import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {mutableState} from 'gs-tools/export/state';
import {intersectType, undefinedType} from 'gs-types';
import {Context, DIV, iattr, icall, id, itarget, ivalue, osingle, ostyle, registerCustomElement} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {pickAction} from '../action/pick-action';
import {rollAction} from '../action/roll-action';
import {DEFAULT_ROTATE_CONFIG, rotateAction, ROTATE_CONFIG_TYPE} from '../action/rotate-action';
import {turnAction} from '../action/turn-action';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {renderRotatable} from '../render/render-rotatable';
import {$getFaceRenderSpec$} from '../renderspec/render-face-spec';
import {ComponentState} from '../types/component-state';
import {IsMultifaced} from '../types/is-multifaced';
import {IsRotatable} from '../types/is-rotatable';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './d1.html';


export interface D2State extends ComponentState, IsRotatable, IsMultifaced { }


export function d2State(id: {}, faces: readonly [unknown, unknown], partial: Partial<D2State> = {}): D2State {
  return {
    id,
    currentFaceIndex: mutableState(0),
    faces,
    rotationDeg: mutableState(0),
    ...partial,
  };
}

const $d2 = {
  host: {
    ...create$baseComponent<D2State>().host,
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
    width: iattr('width'),
  },
  shadow: {
    container: id('container', DIV, {
      height: ostyle('height'),
      face: osingle(),
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
              withLatestFrom($getFaceRenderSpec$.get(this.$.vine)),
              map(([[currentFaceIndex, faces], getFaceRenderSpec]) => {
                return getFaceRenderSpec(faces[currentFaceIndex]);
              }),
              this.$.shadow.container.face(),
          ),
    ];
  }
}

export const D2 = registerCustomElement({
  ctrl: D2Ctrl,
  spec: $d2,
  tag: 'pb-d2',
  template,
});
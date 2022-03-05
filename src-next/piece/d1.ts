import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {mutableState} from 'gs-tools/export/state';
import {intersectType, undefinedType, unknownType} from 'gs-types';
import {Context, iattr, icall, query, itarget, ivalue, ocase, ostyle, registerCustomElement, SLOT} from 'persona';
import {Observable} from 'rxjs';

import {pickAction} from '../action/pick-action';
import {DEFAULT_ROTATE_CONFIG, rotateAction, ROTATE_CONFIG_TYPE} from '../action/rotate-action';
import {BaseComponent, create$baseComponent} from '../core/base-component';
import {renderFace} from '../render/render-face';
import {renderRotatable} from '../render/render-rotatable';
import {ComponentState} from '../types/component-state';
import {IsRotatable} from '../types/is-rotatable';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './d1.html';


export interface D1State extends ComponentState, IsRotatable {
  readonly face: unknown;
}

/**
 * The D1's API.
 *
 * @thModule piece
 */
const $d1 = {
  host: {
    ...create$baseComponent<D1State>().host,
    height: iattr('height'),
    pick: icall('pick', undefinedType),
    pickConfig: ivalue('pickConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK}),
    rotate: icall('rotate', undefinedType),
    rotateConfig: ivalue(
        'rotateConfig',
        intersectType([TRIGGER_SPEC_TYPE, ROTATE_CONFIG_TYPE]),
        {...DEFAULT_ROTATE_CONFIG, type: TriggerType.R},
    ),
    width: iattr('width'),
  },
  shadow: {
    container: query('#container', SLOT, {
      height: ostyle('height'),
      face: ocase(unknownType),
      target: itarget(),
      transform: ostyle('transform'),
      width: ostyle('width'),
    }),
  },
};

export function d1State(id: {}, face: unknown, partial: Partial<D1State> = {}): D1State {
  return {
    id,
    face,
    rotationDeg: mutableState(0),
    ...partial,
  };
}

class D1Ctrl extends BaseComponent<D1State> {
  /**
   * @internal
   */
  constructor(private readonly $: Context<typeof $d1>) {
    super($, 'D1');
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.state._('face').pipe(
          this.$.shadow.container.face(faceId => renderFace(this.$.vine, faceId)),
      ),
      this.$.host.height.pipe(mapNullableTo(''), this.$.shadow.container.height()),
      this.$.host.width.pipe(mapNullableTo(''), this.$.shadow.container.width()),
      this.installAction(
          pickAction,
          'Pick',
          this.$.shadow.container.target,
          this.$.host.pickConfig,
          this.$.host.pick,
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
    ];
  }
}

export const D1 = registerCustomElement({
  ctrl: D1Ctrl,
  spec: $d1,
  tag: 'pb-d1',
  template,
});
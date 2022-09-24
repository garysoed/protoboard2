import {cache} from 'gs-tools/export/data';
import {hasPropertiesType, intersectType} from 'gs-types';
import {Context, itarget, ocase, ostyle, query, registerCustomElement, SLOT} from 'persona';
import {BehaviorSubject, Observable, OperatorFunction} from 'rxjs';

import {BasePiece, create$basePiece} from '../core/base-piece';
import {componentId} from '../id/component-id';
import {renderFace} from '../render/render-face';
import {FaceSpec, FACE_SPEC_TYPE} from '../types/is-multifaced';
import {PieceState, PIECE_STATE_TYPE} from '../types/piece-state';

import template from './d1.html';


export interface D1State extends PieceState {
  readonly face: FaceSpec;
}

const D1_STATE_TYPE = intersectType([
  PIECE_STATE_TYPE,
  hasPropertiesType({
    face: FACE_SPEC_TYPE,
  }),
]);

export function d1State(face: FaceSpec, partial: Partial<D1State> = {}): D1State {
  return {
    id: componentId({}),
    face,
    rotationDeg: new BehaviorSubject(0),
    ...partial,
  };
}

/**
 * The D1's API.
 *
 * @thModule piece
 */
const $d1 = {
  host: {
    ...create$basePiece<D1State>(D1_STATE_TYPE).host,
  },
  shadow: {
    container: query('#container', SLOT, {
      height: ostyle('height'),
      face: ocase<FaceSpec>(),
      target: itarget(),
      transform: ostyle('transform'),
      width: ostyle('width'),
    }),
  },
};

class D1Ctrl extends BasePiece<D1State> {
  /**
   * @internal
   */
  constructor(private readonly $: Context<typeof $d1>) {
    super($, 'D1');
  }

  renderHeight(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.height();
  }

  renderWidth(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.width();
  }

  renderRotationDeg(): OperatorFunction<string, unknown> {
    return this.$.shadow.container.transform();
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.state._('face').pipe(
          this.$.shadow.container.face(renderFace()),
      ),
    ];
  }

  @cache()
  get target$(): Observable<HTMLElement> {
    return this.$.shadow.container.target;
  }
}

export const D1 = registerCustomElement({
  ctrl: D1Ctrl,
  spec: $d1,
  tag: 'pb-d1',
  template,
});
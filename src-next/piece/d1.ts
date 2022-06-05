import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {unknownType} from 'gs-types';
import {Context, itarget, ocase, ostyle, query, registerCustomElement, SLOT} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';

import {BasePiece, create$basePiece} from '../core/base-piece';
import {renderFace} from '../render/render-face';
import {PieceState} from '../types/piece-state';

import template from './d1.html';


export interface D1State extends PieceState {
  readonly face: unknown;
}

/**
 * The D1's API.
 *
 * @thModule piece
 */
const $d1 = {
  host: {
    ...create$basePiece<D1State>().host,
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
      renderFace(
          this.$.vine,
          this.state._('face'),
          render => this.$.shadow.container.face(render),
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
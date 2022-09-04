import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {LineRenderSpec, PAD, StampRenderSpec} from '../../src/region/pad/pad';
import {StampState} from '../../src/region/pad/pad-state';
import {SURFACE} from '../../src/region/surface';
import {TriggerType} from '../../src/types/trigger-spec';
import {FaceType, FACE_SIZE_PX, renderDemoFace} from '../core/render-face';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './pad.html';


const $padDemo = {
  shadow: {
    pad: query('#pad', PAD),
  },
};

const LINE_RED_ID = 'red';
const LINE_GREEN_ID = 'green';
const LINE_BLUE_ID = 'blue';

const STAMP_COIN_ID = FaceType.COIN_FRONT;
const STAMP_GEM_ID = FaceType.GEM;
const STAMP_MEEPLE_ID = FaceType.MEEPLE;


class PadDemo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('pad');

  constructor(private readonly $: Context<typeof $padDemo>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('pad')).pipe(this.$.shadow.pad.state()),
      of([
        {lineId: LINE_RED_ID, lineName: 'Red', type: TriggerType.Q, renderFn: () => renderLine('LINE_RED_ID')},
        {lineId: LINE_GREEN_ID, lineName: 'Green', type: TriggerType.W, renderFn: () => renderLine('LINE_GREEN_ID')},
        {lineId: LINE_BLUE_ID, lineName: 'Blue', type: TriggerType.E, renderFn: () => renderLine('LINE_BLUE_ID')},
      ])
          .pipe(this.$.shadow.pad.lineConfigs()),
      of([
        {stampId: STAMP_COIN_ID, stampName: 'Coin', type: TriggerType.A, renderFn: this.renderStamp(STAMP_COIN_ID)},
        {stampId: STAMP_GEM_ID, stampName: 'Gem', type: TriggerType.S, renderFn: this.renderStamp(STAMP_GEM_ID)},
        {stampId: STAMP_MEEPLE_ID, stampName: 'Meeple', type: TriggerType.D, renderFn: this.renderStamp(STAMP_MEEPLE_ID)},
      ])
          .pipe(this.$.shadow.pad.stampConfigs()),
    ];
  }

  private renderStamp(faceType: FaceType): (state: StampState) => StampRenderSpec {
    return state => renderDemoFace(
        this.$.vine,
        faceType,
        {x: state.x - FACE_SIZE_PX / 2, y: state.y - FACE_SIZE_PX / 2},
    );
  }
}

function renderLine(color: string): LineRenderSpec {
  return {
    stroke: of(color),
    strokeWidth: of(5),
  };
}

export const PAD_DEMO = registerCustomElement({
  ctrl: PadDemo,
  deps: [
    PAD,
    DOCUMENTATION_TEMPLATE,
    ICON,
    SURFACE,
  ],
  spec: $padDemo,
  tag: 'pbd-pad',
  template,
});

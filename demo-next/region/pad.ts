import {enumType, stringType} from 'gs-types';
import {$svgService, ICON, renderTheme} from 'mask';
import {Context, Ctrl, ParseType, query, registerCustomElement, renderString, SVG} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {getPayload as getLineIdPayload, lineId} from '../../src-next/id/line-id';
import {getPayload as getStampIdPayload, stampId} from '../../src-next/id/stamp-id';
import {PAD} from '../../src-next/region/pad/pad';
import {SURFACE} from '../../src-next/region/surface';
import {registerLineRenderSpec} from '../../src-next/renderspec/render-line-spec';
import {registerStampRenderSpec} from '../../src-next/renderspec/render-stamp-spec';
import {TriggerType} from '../../src-next/types/trigger-spec';
import {FaceType} from '../core/rendered-face';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './pad.html';


const $padDemo = {
  shadow: {
    pad: query('#pad', PAD),
  },
};

const LINE_RED_ID = lineId('red');
const LINE_GREEN_ID = lineId('green');
const LINE_BLUE_ID = lineId('blue');

const STAMP_COIN_ID = stampId(FaceType.COIN_FRONT);
const STAMP_GEM_ID = stampId(FaceType.GEM);
const STAMP_MEEPLE_ID = stampId(FaceType.MEEPLE);
const STAMP_SIZE = 50;


class PadDemo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('pad');

  constructor(private readonly $: Context<typeof $padDemo>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('pad')).pipe(this.$.shadow.pad.state()),
      of([
        {lineId: LINE_RED_ID, lineName: 'Red', type: TriggerType.Q},
        {lineId: LINE_GREEN_ID, lineName: 'Green', type: TriggerType.W},
        {lineId: LINE_BLUE_ID, lineName: 'Blue', type: TriggerType.E},
      ])
          .pipe(this.$.shadow.pad.lineConfigs()),
      of([
        {stampId: STAMP_COIN_ID, stampName: 'Coin', type: TriggerType.A},
        {stampId: STAMP_GEM_ID, stampName: 'Gem', type: TriggerType.S},
        {stampId: STAMP_MEEPLE_ID, stampName: 'Meeple', type: TriggerType.D},
      ])
          .pipe(this.$.shadow.pad.stampConfigs()),
    ];
  }
}

export const PAD_DEMO = registerCustomElement({
  ctrl: PadDemo,
  configure: vine => {
    registerLineRenderSpec(vine, id => {
      const payload = getLineIdPayload(id);
      if (!stringType.check(payload)) {
        return null;
      }

      return {
        stroke: of(payload),
        strokeWidth: of(5),
      };
    });
    registerStampRenderSpec(vine, state => {
      const payload = getStampIdPayload(state.stampId);
      if (!enumType<FaceType>(FaceType).check(payload)) {
        return null;
      }
      const svg$ = $svgService.get(vine).getSvg(payload);
      return renderString({
        // TODO: Remove the ??
        raw: svg$.pipe(map(content => content ?? '')),
        spec: {
          root: query(null, SVG, {}),
        },
        parseType: ParseType.SVG,
        runs: $ => [
          of(state.x).pipe(map(v => v - STAMP_SIZE / 2), $.root.x()),
          of(state.y).pipe(map(v => v - STAMP_SIZE / 2), $.root.y()),
          of(STAMP_SIZE).pipe($.root.width()),
          of(STAMP_SIZE).pipe($.root.height()),
        ],
      });
    });
  },
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

import {stringType} from 'gs-types';
import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {getPayload, lineId} from '../../src-next/id/line-id';
import {PAD} from '../../src-next/pad/pad';
import {SURFACE} from '../../src-next/region/surface';
import {registerLineRenderSpec} from '../../src-next/renderspec/render-line-spec';
import {TriggerType} from '../../src-next/types/trigger-spec';
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
    ];
  }
}

export const PAD_DEMO = registerCustomElement({
  ctrl: PadDemo,
  configure: vine => {
    registerLineRenderSpec(vine, id => {
      const payload = getPayload(id);
      if (!stringType.check(payload)) {
        return null;
      }

      return {
        stroke: of(payload),
        strokeWidth: of(5),
      };
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

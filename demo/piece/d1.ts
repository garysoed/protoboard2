import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {D1} from '../../src/piece/d1';
import {SURFACE} from '../../src/region/surface';
import {$state} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './d1.html';


const $d1Demo = {
  shadow: {
    gemSlot: query('#gemSlot', SURFACE, {}),
    meepleSlot: query('#meepleSlot', SURFACE, {}),
  },
};


class D1Demo implements Ctrl {
  private readonly state = $state.get(this.$.vine).d1;

  constructor(private readonly $: Context<typeof $d1Demo>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state.gemSlot).pipe(this.$.shadow.gemSlot.state()),
      of(this.state.meepleSlot).pipe(this.$.shadow.meepleSlot.state()),
    ];
  }
}

export const D1_DEMO = registerCustomElement({
  ctrl: D1Demo,
  deps: [
    D1,
    DOCUMENTATION_TEMPLATE,
    ICON,
    SURFACE,
  ],
  spec: $d1Demo,
  tag: 'pbd-d1',
  template,
});

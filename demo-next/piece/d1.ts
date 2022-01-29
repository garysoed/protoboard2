import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, id, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {D1} from '../../src-next/piece/d1';
import {SLOT} from '../../src-next/region/slot';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './d1.html';


const $d1Demo = {
  shadow: {
    gemSlot: id('gemSlot', SLOT, {}),
    meepleSlot: id('meepleSlot', SLOT, {}),
  },
};


class D1Demo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('d1');

  constructor(private readonly $: Context<typeof $d1Demo>) {
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('gemSlot')).pipe(this.$.shadow.gemSlot.state()),
      of(this.state$._('meepleSlot')).pipe(this.$.shadow.meepleSlot.state()),
    ];
  }
}

export const D1_DEMO = registerCustomElement({
  ctrl: D1Demo,
  deps: [
    D1,
    DOCUMENTATION_TEMPLATE,
    ICON,
    SLOT,
  ],
  spec: $d1Demo,
  tag: 'pbd-d1',
  template,
});

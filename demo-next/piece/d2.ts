import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {D2} from '../../src-next/piece/d2';
import {SLOT} from '../../src-next/region/slot';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './d2.html';


const $d2Demo = {
  shadow: {
    cardSlot: query('#cardSlot', SLOT),
    coinSlot: query('#coinSlot', SLOT),
  },
};

class D2Demo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('d2');

  constructor(private readonly $: Context<typeof $d2Demo>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('cardSlot')).pipe(this.$.shadow.cardSlot.state()),
      of(this.state$._('coinSlot')).pipe(this.$.shadow.coinSlot.state()),
    ];
  }
}

export const D2_DEMO = registerCustomElement({
  ctrl: D2Demo,
  deps: [
    D2,
    DOCUMENTATION_TEMPLATE,
    ICON,
    SLOT,
  ],
  spec: $d2Demo,
  tag: 'pbd-d2',
  template,
});

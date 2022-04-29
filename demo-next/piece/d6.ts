import {cache} from 'gs-tools/export/data';
import {ICON, renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {D6} from '../../src-next/piece/d6';
import {SURFACE} from '../../src-next/region/surface';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './d6.html';


export const $d6Demo = {
  shadow: {
    diceSlot: query('#diceSlot', SURFACE),
  },
};

class D6Demo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('d6');

  constructor(private readonly $: Context<typeof $d6Demo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('diceSlot')).pipe(this.$.shadow.diceSlot.state()),
    ];
  }
}

export const D6_DEMO = registerCustomElement({
  ctrl: D6Demo,
  deps: [
    D6,
    DOCUMENTATION_TEMPLATE,
    ICON,
    SURFACE,
  ],
  spec: $d6Demo,
  tag: 'pbd-d6',
  template,
});
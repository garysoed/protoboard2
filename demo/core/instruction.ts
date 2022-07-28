import {renderTheme} from 'mask';
import {Context, Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import template from './instruction.html';


export const $instruction = { };

export class Instruction implements Ctrl {
  constructor(private readonly $: Context<typeof $instruction>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
    ];
  }
}

export const INSTRUCTION = registerCustomElement({
  ctrl: Instruction,
  spec: $instruction,
  tag: 'pbd-instruction',
  template,
});
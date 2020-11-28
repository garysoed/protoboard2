import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import template from './instruction.html';


export const $instruction = {
  tag: 'pbd-instruction',
  api: {},
};

@_p.customElement({
  ...$instruction,
  template,
})
export class Instruction extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

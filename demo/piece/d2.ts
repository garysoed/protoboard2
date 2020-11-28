import {BaseThemedCtrl, Icon, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {D2} from '../../src/piece/d2';
import {PieceTemplate} from '../template/piece-template';

import template from './d2.html';


export const $d2Demo = {
  tag: 'pbd-d2',
  api: {},
};

@_p.customElement({
  ...$d2Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D2,
  ],
  template,
})
export class D2Demo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

import {BaseThemedCtrl, Icon, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {D1} from '../../src/piece/d1';
import {PieceTemplate} from '../template/piece-template';

import template from './d1.html';


export const $d1Demo = {
  tag: 'pbd-d1',
  api: {},
};


@_p.customElement({
  ...$d1Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D1,
  ],
  template,
})
export class D1Demo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

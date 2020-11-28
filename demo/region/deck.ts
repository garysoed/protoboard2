import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {Deck} from '../../src/region/deck';
import {RegionTemplate} from '../template/region-template';

import template from './deck.html';


export const $deckDemo = {
  tag: 'pbd-deck',
  api: {},
};

@_p.customElement({
  ...$deckDemo,
  template,
  dependencies: [
    Deck,
    RegionTemplate,
  ],
})
export class DeckDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

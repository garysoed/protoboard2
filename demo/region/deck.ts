import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {Deck} from '../../src/region/deck';

import template from './deck.html';

export const $deckDemo = {
  tag: 'pbd-deck',
  api: {},
};

const $ = {};

@_p.customElement({
  ...$deckDemo,
  template,
  dependencies: [
    Deck,
  ],
})
export class DeckDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}
import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {DECK} from '../../src/region/deck';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './deck.html';


export const deckDemo = {
  shadow: {
    deck: query('#deck', DECK),
  },
};

class DeckDemo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('deck');

  constructor(private readonly $: Context<typeof deckDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('deck')).pipe(this.$.shadow.deck.state()),
    ];
  }
}

export const DECK_DEMO = registerCustomElement({
  ctrl: DeckDemo,
  deps: [
    DOCUMENTATION_TEMPLATE,
    DECK,
  ],
  spec: deckDemo,
  tag: 'pbd-deck',
  template,
});
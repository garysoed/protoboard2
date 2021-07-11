import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {BaseThemedCtrl, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$deck, Deck, deckSpec, DeckSpec} from '../../src/region/deck';

import template from './deck.html';


export const $deckDemo = {
  tag: 'pbd-deck',
  api: {},
};

type State = DeckSpec;

const $stateId = rootStateIdSource<State>(() => deckSpec({}));
const $statePath = immutablePathSource($stateId);

const $ = {
  deck: element('deck', $deck, {}),
};

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
    return [
      this.renderers.deck.objectPath(of($statePath.get(this.vine))),
    ];
  }
}
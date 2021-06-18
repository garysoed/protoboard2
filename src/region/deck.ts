import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$div, attributeIn, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {shuffleAction, shuffleActionConfigSpecs} from '../action/shuffle-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './deck.html';


export const $deck = {
  tag: 'pb-deck',
  api: {
    objectId: attributeIn('object-id', stateIdParser<DeckSpec>()),
    dropAction: dropActionConfigSpecs({}),
    shuffleAction: shuffleActionConfigSpecs({}),
  },
};

export const $ = {
  host: host($deck.api),
  root: element('root', $div, {
    contents: multi('#contents'),
  }),
};

export type DeckSpec = IsContainer<'indexed'>;

interface Input<P> {
  readonly type: string;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>;
  readonly payload: P;
}

export function deckSpec<P>(input: Input<P>): DeckSpec {
  return {...input, containerType: 'indexed'};
}

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckSpec, typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<DeckSpec, TriggerConfig>> {
    return [
      dropAction(compileConfig($.host._.dropAction, this.context), this.context),
      shuffleAction(compileConfig($.host._.shuffleAction, this.context), this.context),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.contents(
          this.objectId$.pipe(
              switchMap(objectId => renderContents(objectId, this.vine)),
          ),
      ),
    ];
  }
}

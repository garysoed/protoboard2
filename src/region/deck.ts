import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$div, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {shuffleAction, shuffleActionConfigSpecs} from '../action/shuffle-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './deck.html';


export const $deck = {
  tag: 'pb-deck',
  api: {
    ...$baseComponent.api,
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
    super(
        [
          dropAction($.host._.dropAction),
          shuffleAction($.host._.shuffleAction),
        ],
        context,
        $,
    );
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

import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$div, attributeIn, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ActionSpec} from '../action/action-spec';
import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {dropAllAction, dropAllActionConfigSpecs} from '../action/drop-all-action';
import {pickAllAction, pickAllActionConfigSpecs} from '../action/pick-all-action';
import {shuffleAction, shuffleActionConfigSpecs} from '../action/shuffle-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
import {IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './deck.html';


export const $deck = {
  tag: 'pb-deck',
  api: {
    objectId: attributeIn('object-id', stateIdParser<DeckSpec>()),
    dropAction: dropActionConfigSpecs({}),
    dropAllAction: dropAllActionConfigSpecs({}),
    pickAllAction: pickAllActionConfigSpecs({}),
    shuffleAction: shuffleActionConfigSpecs({}),
  },
};

export const $ = {
  host: host($deck.api),
  root: element('root', $div, {
    contents: multi('#contents'),
  }),
};

export type DeckSpec = IsContainer;

export function deckSpec(input: Partial<DeckSpec>, x: Modifier): DeckSpec {
  return {
    contentsId: input.contentsId ?? x.add([]),
  };
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
  protected get actions(): readonly ActionSpec[] {
    return [
      this.createActionSpec(dropAction, compileConfig($.host._.dropAction, this.context), 'Drop'),
      this.createActionSpec(dropAllAction, compileConfig($.host._.dropAllAction, this.context), 'Drop all'),
      this.createActionSpec(pickAllAction, compileConfig($.host._.pickAllAction, this.context), 'Pick all'),
      this.createActionSpec(shuffleAction, compileConfig($.host._.shuffleAction, this.context), 'Shuffle'),
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

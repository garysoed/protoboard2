import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$div, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {dropAction, PositioningType} from '../action/drop-action';
import {shuffleAction} from '../action/shuffle-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {ContentSpec} from '../payload/is-container';
import {renderContents} from '../render/render-contents';
import {containerSpec, ContainerSpec} from '../types/container-spec';

import template from './deck.html';


export const $deck = {
  tag: 'pb-deck',
  api: {...$baseComponent.api},
};

export const $ = {
  host: host($deck.api),
  root: element('root', $div, {
    contents: multi('#contents'),
  }),
};

export type DeckSpec<P> = ContainerSpec<P, 'indexed'>;

interface Input<P> {
  readonly type: string;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>;
  readonly payload: P;
}

export function deckSpec<P>(input: Input<P>): DeckSpec<P> {
  return containerSpec({
    ...input,
    containerType: 'indexed',
  });
}

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckSpec<unknown>, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          dropAction({positioning: PositioningType.DEFAULT, trigger: TriggerType.D}),
          shuffleAction({trigger: TriggerType.S}),
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

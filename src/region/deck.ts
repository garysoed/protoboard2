import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {_p} from 'mask';
import {PersonaContext, element, multi, host} from 'persona';
import {Observable} from 'rxjs';
import {Logger} from 'santa';

import {DropAction} from '../action/drop-action';
import {ShuffleAction} from '../action/shuffle-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './deck.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('pb.Deck');


export const $deck = {
  tag: 'pb-deck',
  api: {...$baseComponent.api},
};

export const $ = {
  host: host($deck.api),
  root: element('root', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
};

export type DeckPayload = IsContainer<'indexed'>;

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckPayload, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
          {trigger: TriggerType.S, provider: context => new ShuffleAction(context)},
        ],
        context,
        $,
    );

    this.addSetup(renderContents(this.objectPayload$, $.root._.contents, this.context));
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

import { $baseComponent, BaseComponent } from '../core/base-component';
import { DropAction } from '../action/drop-action';
import { IsContainer } from '../payload/is-container';
import { Logger } from 'santa';
import { PersonaContext, element, multi } from 'persona';
import { ShuffleAction } from '../action/shuffle-action';
import { TriggerType } from '../core/trigger-spec';
import { _p } from 'mask';
import { instanceofType } from 'gs-types';
import { renderContents } from '../render/render-contents';
import template from './deck.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('pb.Deck');


export const $deck = {
  tag: 'pb-deck',
  api: {...$baseComponent.api},
};

export const $ = {
  root: element('root', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
};

export type DeckPayload = IsContainer<'indexed'>;

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckPayload> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
          {trigger: TriggerType.S, provider: context => new ShuffleAction(context)},
        ],
        context,
    );

    this.addSetup(renderContents(this.objectPayload$, $.root._.contents, this.context));
  }
}

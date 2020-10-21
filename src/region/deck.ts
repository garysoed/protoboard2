import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, NodeWithId, PersonaContext, single } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { Logger } from 'santa';

import { DropAction } from '../action/drop-action';
import { PickAction } from '../action/pick-action';
import { ShuffleAction } from '../action/shuffle-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerType } from '../core/trigger-spec';
import { IsContainer } from '../payload/is-container';

import template from './deck.html';


const LOGGER = new Logger('pb.Deck');


export const $deck = {
  tag: 'pb-deck',
  api: {...$baseComponent.api},
};

export const $ = {
  host: host($deck.api),
  contents: element('contents', instanceofType(HTMLDivElement), {
    contents: single('#contents'),
  }),
  target: element('target', instanceofType(HTMLDivElement), {}),
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
          {trigger: TriggerType.CLICK, provider: context => new PickAction(() => 0, context, {})},
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
          {trigger: TriggerType.S, provider: context => new ShuffleAction(context)},
        ],
        context,
    );

    this.render($.contents._.contents, this.contents$);
  }

  @cache()
  private get contents$(): Observable<NodeWithId|null> {
    // TODO
    return observableOf(null);
    // return this.objectSpec$.pipe(
    //     switchMap(state => state?.payload.contentIds || observableOf([])),
    //     withLatestFrom($objectService.get(this.vine)),
    //     switchMap(([contentIds, renderableService]) => {
    //       const [topId] = contentIds;
    //       if (!topId) {
    //         return observableOf(null);
    //       }

    //       return renderableService.getObject(topId, this.context);
    //     }),
    //     debug(LOGGER, 'node'),
    // );
  }
}

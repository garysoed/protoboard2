import { cache } from 'gs-tools/export/data';
import { debug } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, PersonaContext, single } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { DropAction } from '../action/drop-action';
import { DroppablePayload } from '../action/payload/droppable-payload';
import { PickAction } from '../action/pick-action';
import { ShuffleAction } from '../action/shuffle-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { $stateService } from '../state/state-service';

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

export interface DeckPayload extends DroppablePayload { }

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckPayload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<DeckPayload, any>>([
          [TriggerSpec.CLICK, context => new PickAction(context, {location: 0})],
          [TriggerSpec.D, context => new DropAction(context, {location: 0})],
          [TriggerSpec.S, context => new ShuffleAction(context)],
        ]),
        context,
        $.target,
    );

    this.render($.contents._.contents, this.contents$);
  }

  @cache()
  private get contents$(): Observable<Node|null> {
    return this.state$.pipe(
        switchMap(state => state?.payload.contentIds || observableOf([])),
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([contentIds, stateService]) => {
          const [topId] = contentIds;
          if (!topId) {
            return observableOf(null);
          }

          return stateService.getObject(topId, this.context);
        }),
        debug(LOGGER, 'node'),
    );
  }
}
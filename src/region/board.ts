import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext, renderCustomElement } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DroppablePayload } from '../action/payload/droppable-payload';
import { PickAction } from '../action/pick-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerSpec } from '../core/trigger-spec';
import { renderContents } from '../render/render-contents';
import { registerStateHandler } from '../state/state-service';

import template from './board.html';


/**
 * The supply object API.
 *
 * @thModule region
 */
export const $board = {
  tag: 'pb-board',
  api: {
    ...$baseComponent.api,
  },
};


export const $ = {
  host: host($board.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

/**
 * Payload of the supply region.
 *
 * @thModule region
 */
export type BoardPayload = DroppablePayload;


/**
 * Represents a region containing the supply.
 *
 * @thModule region
 */
@_p.customElement({
  ...$board,
  template,
})
export class Board extends BaseComponent<BoardPayload> {
  constructor(context: PersonaContext) {
    super(
        new Map([
          [TriggerSpec.CLICK, context => new PickAction(context, {location: 0})],
        ]),
        context,
        $.host,
    );

    this.render($.root._.content, this.contents$);
  }

  @cache()
  private get contents$(): Observable<readonly Node[]> {
    return this.state$.pipe(
      switchMap(state => {
        if (!state) {
          return observableOf([]);
        }

        return renderContents(state, this.context);
      }),
    );
  }
}

import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext, renderCustomElement } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DroppablePayload } from '../action/payload/droppable-payload';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { renderContents } from '../render/render-contents';
import { registerStateHandler } from '../state/state-service';

import template from './supply.html';


/**
 * Type of the supply region.
 *
 * @thModule region
 */
export const SUPPLY_TYPE = 'pb.supply';

/**
 * ID of the object representing the supply region.
 *
 * @thModule region
 */
export const SUPPLY_ID = 'pb.supply';


/**
 * The supply object API.
 *
 * @thModule region
 */
export const $supply = {
  tag: 'pb-supply',
  api: {
    ...$baseComponent.api,
  },
};


export const $ = {
  host: host($supply.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

/**
 * Payload of the supply region.
 *
 * @thModule region
 */
// tslint:disable-next-line: no-empty-interface
export interface SupplyPayload extends DroppablePayload { }


/**
 * Represents a region containing the supply.
 *
 * @thModule region
 */
@_p.customElement({
  ...$supply,
  template,
  configure: vine => {
    registerStateHandler<SupplyPayload>(
        SUPPLY_TYPE,
        (state, context) => {
          return renderCustomElement(
              $supply,
              {inputs: {objectId: observableOf(state.id)}},
              context,
          );
        },
        vine,
    );
  },
})
export class Supply extends BaseComponent<SupplyPayload> {
  constructor(context: PersonaContext) {
    super(new Map(), context);

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

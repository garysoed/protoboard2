import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { $baseComponent, BaseComponent } from '../core/base-component';
import { $stateService, registerStateHandler } from '../state/state-service';

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
export interface SupplyPayload {
  /**
   * ID of objects that are in the supply.
   */
  readonly contentIds: readonly string[];
}


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
      withLatestFrom($stateService.get(this.vine)),
      switchMap(([state, service]) => {
        if (!state) {
          return observableOf([]);
        }

        return state.payload.contentIds.pipe(
            switchMap(contentIds => {
              const node$list = $pipe(
                  new Set<string>(contentIds),
                  $map(id => service.getObject(id, this.context).pipe(filterNonNull())),
                  $asArray(),
              );

              return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
            }),
        );
      }),
    );
  }
}

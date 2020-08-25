import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DropAction } from '../action/drop-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerSpec } from '../core/trigger-spec';
import { $stateService } from '../state/state-service';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseComponent.api,
  },
};

export const $ = {
  host: host($slot.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

export interface SlotPayload {
  readonly contentIds: readonly string[];
}

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotPayload> {
  constructor(context: PersonaContext) {
    super(
        new Map([
          [TriggerSpec.D, DropAction],
        ]),
        context,
    );

    this.render($.root._.content, this.contents$);
  }

  @cache()
  private get contents$(): Observable<readonly Node[]> {
    return combineLatest([this.declareInput($.host._.objectId), $stateService.get(this.vine)]).pipe(
        switchMap(([objectId, service]) => {
          if (!objectId) {
            return observableOf([]);
          }
          const state = service.getState<SlotPayload>(objectId);
          if (!state) {
            return observableOf([]);
          }

          return state.payload.contentIds.pipe(
              switchMap(contentIds => {
                const node$list = $pipe(
                    contentIds,
                    $map(id => service.getObject(id, this.context)),
                    $filterNonNull(),
                    $asArray(),
                );
                return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
              }),
          );
        }),
    );
  }
}

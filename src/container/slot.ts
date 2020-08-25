import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { $baseActionApi, BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { UnreservedTriggerSpec } from '../core/trigger-spec';
import { $stateService } from '../state/state-service';

import template from './slot.html';


// import { DropAction } from '../action/drop-action';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseActionApi,
  },
};

const $ = {
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
export class Slot extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          // [TriggerSpec.D, new DropAction($.host.getValue(context), context.vine)],
        ]),
        context,
    );

    this.render($.root._.content, this.contents$);
  }

  @cache()
  private get contents$(): Observable<readonly Node[]> {
    return this.declareInput($.host._.objectId).pipe(
        withLatestFrom($stateService.get(this.vine)),
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

import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { attributeIn, element, host, listParser, multi, PersonaContext, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { $stateService } from '../state/state-service';

import template from './slot.html';

// import { DropAction } from '../action/drop-action';


const $$ = {
  tag: 'pb-slot',
  api: {
    contentIds: attributeIn('content-ids', listParser(stringParser())),
  },
};

const $ = {
  host: host($$.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

@_p.customElement({
  ...$$,
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
    return this.declareInput($.host._.contentIds).pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([ids, service]) => {
          const node$List = $pipe(
              new Set(ids),
              $map(id => service.getObject(id, this.context)),
              $filterNonNull(),
              $asArray(),
          );

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }
}

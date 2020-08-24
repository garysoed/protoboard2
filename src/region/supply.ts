import { source, Vine } from 'grapevine';
import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { debug } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { $dialogState, _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, host, listParser, multi, PersonaContext, renderCustomElement, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { registerStateHandler } from '../state/register-state-handler';
import { $stateService } from '../state/state-service';

import template from './supply.html';

export const SUPPLY_TYPE = 'pb.supply';
export const SUPPLY_ID = 'pb.supply';

const $supply = {
  tag: 'pb-supply',
  api: {
    supplyIds: attributeIn('supply-ids', listParser(stringParser())),
  },
};

const $ = {
  host: host($supply.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

@_p.customElement({
  ...$supply,
  template,
  configure: vine => {
    registerStateHandler(
        SUPPLY_TYPE,
        (state, context) => {
          const subject = state.payload.get('supplyIds');
          console.log(`supply: ${(subject as any).id}`);
          return renderCustomElement(
              $supply,
              {inputs: {supplyIds: subject?.pipe(debug('supplyIds'))}},
              context,
          );
        },
        vine,
    );
  },
})
export class Supply extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.root._.content, this.contents$);
  }

  @cache()
  private get contents$(): Observable<readonly Node[]> {
    return this.declareInput($.host._.supplyIds).pipe(
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

import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { debug } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { $iconWithText, _p, IconWithText, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import template from './staging-area.html';
import { $stagingService } from './staging-service';


export const $stagingArea = {
  tag: 'pbd-staging-area',
  api: {},
};

const $ = {
  list: element('list', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

@_p.customElement({
  ...$stagingArea,
  dependencies: [IconWithText],
  template,
})
export class StagingArea extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.list._.content, this.contentNodes$);
  }

  @cache()
  private get contentNodes$(): Observable<readonly Node[]> {
    return $stagingService.get(this.vine).pipe(
        debug('service'),
        switchMap(service => service.states$),
        debug('states'),
        switchMap(states => {
          const node$List = $pipe(
              states,
              $map(state => renderCustomElement(
                  $iconWithText,
                  {inputs: {label: observableOf(state.id)}},
                  this.context,
              )),
              $asArray(),
          );

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }
}

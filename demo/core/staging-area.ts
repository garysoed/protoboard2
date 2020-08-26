import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $iconWithText, $textIconButton, _p, IconWithText, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

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
  startButton: element('startButton', $textIconButton, {}),
};

@_p.customElement({
  ...$stagingArea,
  dependencies: [
    IconWithText,
    TextIconButton,
  ],
  template,
})
export class StagingArea extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.list._.content, this.contentNodes$);
    this.addSetup(this.handleStartAction$);
  }

  @cache()
  private get contentNodes$(): Observable<readonly Node[]> {
    return $stagingService.get(this.vine).pipe(
        switchMap(service => service.states$),
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

  @cache()
  private get handleStartAction$(): Observable<unknown> {
    return this.declareInput($.startButton._.actionEvent).pipe(
        withLatestFrom($stagingService.get(this.vine)),
        switchMap(([, service]) => service.setStaging(false)),
    );
  }
}

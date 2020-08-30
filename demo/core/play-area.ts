import { cache } from 'gs-tools/export/data';
import { $textIconButton, _p, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext, renderCustomElement } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { $slot, Slot } from '../../src/container/slot';
import { Supply } from '../../src/region/supply';
import { Render } from '../../src/state/render';
import { registerStateHandler } from '../../src/state/state-service';

import template from './play-area.html';
import { ROOT_SLOT_TYPE } from './staging-area';
import { $stagingService } from './staging-service';


const $ = {
  clearButton: element('clearButton', $textIconButton, {}),
};

@_p.customElement({
  dependencies: [
    Render,
    Slot,
    Supply,
  ],
  configure: vine => {
    registerStateHandler(
        ROOT_SLOT_TYPE,
        (state, context) => {
          return renderCustomElement(
              $slot,
              {inputs: {objectId: observableOf(state.id)}},
              context,
          );
        },
        vine,
    );
  },
  tag: 'pbd-play-area',
  template,
  api: {},
})
export class PlayArea extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleClearClick$);
  }

  @cache()
  private get handleClearClick$(): Observable<unknown> {
    return this.declareInput($.clearButton._.actionEvent).pipe(
        withLatestFrom($stagingService.get(this.vine)),
        tap(([, stagingService]) => {
          stagingService.setStaging(true);
          stagingService.clear();
        }),
    );
  }
}

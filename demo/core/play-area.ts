import { cache } from 'gs-tools/export/data';
import { $button, $stateService, _p, Button, LineLayout, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { Render } from '../../src/objects/render';
import { Slot } from '../../src/region/slot';

import template from './play-area.html';
import { $stagingService } from './staging-service';


const $ = {
  clearButton: element('clearButton', $button, {}),
};

@_p.customElement({
  dependencies: [
    Button,
    LineLayout,
    Render,
    Slot,
  ],
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
        withLatestFrom($stagingService.get(this.vine), $stateService.get(this.vine)),
        tap(([, stagingService, stateService]) => {
          stateService.clear();
          stagingService.setStaging(true);
          stagingService.clear();
        }),
    );
  }
}

import {cache} from 'gs-tools/export/data';
import {$button, _p, Button, LineLayout, ThemedCustomElementCtrl} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {$render, Render} from '../../src/objects/render';
import {Slot} from '../../src/region/slot';
import {$objectSpecs} from '../state/getters/play-state';
import {$setStaging} from '../state/setters/demo-state';
import {GridArea} from '../state/types/region-state';

import template from './play-area.html';


const $ = {
  clearButton: element('clearButton', $button, {}),
  renderSmall1: element('renderSmall1', $render, {}),
  renderSmall2: element('renderSmall2', $render, {}),
  renderSmall3: element('renderSmall3', $render, {}),
  renderSmall4: element('renderSmall4', $render, {}),
  renderSmall5: element('renderSmall5', $render, {}),
  renderSmall6: element('renderSmall6', $render, {}),
  renderSide: element('renderSide', $render, {}),
  renderLarge: element('renderLarge', $render, {}),
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
    this.render($.renderSmall1._.objectId, this.getObjectIdAt(GridArea.SMALL1));
    this.render($.renderSmall2._.objectId, this.getObjectIdAt(GridArea.SMALL2));
    this.render($.renderSmall3._.objectId, this.getObjectIdAt(GridArea.SMALL3));
    this.render($.renderSmall4._.objectId, this.getObjectIdAt(GridArea.SMALL4));
    this.render($.renderSmall5._.objectId, this.getObjectIdAt(GridArea.SMALL5));
    this.render($.renderSmall6._.objectId, this.getObjectIdAt(GridArea.SMALL6));
    this.render($.renderSide._.objectId, this.getObjectIdAt(GridArea.SIDE));
    this.render($.renderLarge._.objectId, this.getObjectIdAt(GridArea.LARGE));
  }

  private getObjectIdAt(gridArea: GridArea): Observable<string|undefined> {
    return this.objectSpecMap$.pipe(map(specMap => specMap.get(gridArea)));
  }

  @cache()
  private get handleClearClick$(): Observable<unknown> {
    return this.declareInput($.clearButton._.actionEvent).pipe(
        withLatestFrom($setStaging.get(this.vine)),
        tap(([, setStaging]) => {
          if (!setStaging) {
            return;
          }
          setStaging(true);
        }),
    );
  }

  @cache()
  private get objectSpecMap$(): Observable<ReadonlyMap<GridArea, string>> {
    return $objectSpecs.get(this.vine).pipe(
        map(specs => {
          const objectSpecMap = new Map<GridArea, string>();
          for (const spec of specs) {
            if (spec.payload.type !== 'region') {
              continue;
            }

            if (!spec.payload.gridArea) {
              continue;
            }

            objectSpecMap.set(spec.payload.gridArea, spec.id);
          }

          return objectSpecMap;
        }),
    );
  }
}

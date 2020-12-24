import {$asMap, $filterNonNull, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {$button, BaseThemedCtrl, Button, LineLayout, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, tap, withLatestFrom, switchMap} from 'rxjs/operators';

import {$getObjectSpec} from '../../src/objects/getters/root-state';
import {$render, Render} from '../../src/objects/render';
import {Slot} from '../../src/region/slot';
import {ObjectSpec} from '../../src/types/object-spec';
import {$objectSpecIds, $supplyId} from '../state/getters/play-state';
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
  supply: element('supply', $render, {}),
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
export class PlayArea extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.handleClearClick$);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.renderSmall1.objectId(this.getObjectIdAt(GridArea.SMALL1)),
      this.renderers.renderSmall2.objectId(this.getObjectIdAt(GridArea.SMALL2)),
      this.renderers.renderSmall3.objectId(this.getObjectIdAt(GridArea.SMALL3)),
      this.renderers.renderSmall4.objectId(this.getObjectIdAt(GridArea.SMALL4)),
      this.renderers.renderSmall5.objectId(this.getObjectIdAt(GridArea.SMALL5)),
      this.renderers.renderSmall6.objectId(this.getObjectIdAt(GridArea.SMALL6)),
      this.renderers.renderSide.objectId(this.getObjectIdAt(GridArea.SIDE)),
      this.renderers.renderLarge.objectId(this.getObjectIdAt(GridArea.LARGE)),
      this.renderers.supply.objectId($supplyId.get(this.vine).pipe(map(id => id ?? undefined))),
    ];
  }

  private getObjectIdAt(gridArea: GridArea): Observable<StateId<ObjectSpec<any>>|undefined> {
    return this.objectSpecMap$.pipe(map(specMap => specMap.get(gridArea)));
  }

  @cache()
  private get handleClearClick$(): Observable<unknown> {
    return this.inputs.clearButton.actionEvent.pipe(
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
  private get objectSpecMap$(): Observable<ReadonlyMap<GridArea, StateId<ObjectSpec<any>>>> {
    return combineLatest([$objectSpecIds.get(this.vine), $getObjectSpec.get(this.vine)]).pipe(
        switchMap(([specIds, getObjectSpec]) => {
          const pair$list = specIds.map(
              id => getObjectSpec(id).pipe(map(spec => {
                if (!spec) {
                  return null;
                }

                if (spec.payload.type !== 'region') {
                  return null;
                }

                if (!spec.payload.gridArea) {
                  return null;
                }

                return [spec.payload.gridArea, id] as const;
              })),
          );

          if (pair$list.length <= 0) {
            return observableOf([]);
          }

          return combineLatest(pair$list);
        }),
        map(pairlist => $pipe(pairlist, $filterNonNull(), $asMap())),
    );
  }
}

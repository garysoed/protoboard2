import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {$button, $lineLayout, BaseThemedCtrl, Button, LineLayout, _p} from 'mask';
import {$div, element, multi, PersonaContext, renderCustomElement, RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {$pieceSpecs, $regionSpecs} from '../state/getters/staging-state';
import {$setStaging} from '../state/setters/demo-state';

import template from './staging-area.html';


export const $stagingArea = {
  tag: 'pbd-staging-area',
  api: {},
};

const $ = {
  list: element('list', $div, {
    pieces: multi('#pieces'),
    regions: multi('#regions'),
  }),
  startButton: element('startButton', $button, {}),
};

@_p.customElement({
  ...$stagingArea,
  dependencies: [
    Button,
    LineLayout,
  ],
  template,
})
export class StagingArea extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
    this.addSetup(this.handleStartAction$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.list.pieces(this.piecesNodes$),
      this.renderers.list.regions(this.regionsNodes$),
    ];
  }

  @cache()
  private get handleStartAction$(): Observable<unknown> {
    return this.inputs.startButton.actionEvent.pipe(
        withLatestFrom($setStaging.get(this.vine)),
        tap(([, setStaging]) => {
          if (!setStaging) {
            return;
          }

          setStaging(false);
        }),
    );
  }

  @cache()
  private get piecesNodes$(): Observable<readonly RenderSpec[]> {
    return $pieceSpecs.get(this.vine).pipe(
        map(specs => {
          const node$List = $pipe(
              specs || [],
              $map(spec => {
                const label = `${spec.componentTag.substr(3)}: ${spec.icons.join(', ')}`;

                return renderCustomElement({
                  spec: $lineLayout,
                  textContent: label,
                  id: label,
                });
              }),
              $asArray(),
          );

          return node$List.length <= 0 ? [] : node$List;
        }),
    );
  }

  @cache()
  private get regionsNodes$(): Observable<readonly RenderSpec[]> {
    return $regionSpecs.get(this.vine).pipe(
        map(specs => {
          const node$List = $pipe(
              specs || [],
              $map(spec => {
                const label = `${spec.componentTag.substr(3)}: ${spec.gridArea}`;

                return renderCustomElement({
                  spec: $lineLayout,
                  textContent: label,
                  id: label,
                });
              }),
              $asArray(),
          );

          return node$List.length <= 0 ? [] : node$List;
        }),
    );
  }
}


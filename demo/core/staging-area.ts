import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {$button, $lineLayout, BaseThemedCtrl, Button, LineLayout, _p} from 'mask';
import {element, multi, NodeWithId, PersonaContext, renderCustomElement} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$pieceSpecs, $regionSpecs} from '../state/getters/staging-state';
import {$setStaging} from '../state/setters/demo-state';

import template from './staging-area.html';


export const $stagingArea = {
  tag: 'pbd-staging-area',
  api: {},
};

const $ = {
  list: element('list', instanceofType(HTMLDivElement), {
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
  private get piecesNodes$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return $pieceSpecs.get(this.vine).pipe(
        switchMap(specs => {
          const node$List = $pipe(
              specs || [],
              $map(spec => {
                const label = `${spec.componentTag.substr(3)}: ${spec.icons.join(', ')}`;

                return renderCustomElement(
                    $lineLayout,
                    {textContent: observableOf(label)},
                    label,
                    this.context,
                );
              }),
              $asArray(),
          );

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }

  @cache()
  private get regionsNodes$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return $regionSpecs.get(this.vine).pipe(
        switchMap(specs => {
          const node$List = $pipe(
              specs || [],
              $map(spec => {
                const label = `${spec.componentTag.substr(3)}: ${spec.gridArea}`;

                return renderCustomElement(
                    $lineLayout,
                    {textContent: observableOf(label)},
                    label,
                    this.context,
                );
              }),
              $asArray(),
          );

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }
}


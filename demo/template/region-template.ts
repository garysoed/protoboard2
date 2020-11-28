import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {$button, $lineLayout, $overlayLayout, $simpleRadioInput, BaseThemedCtrl, Button, LineLayout, OverlayLayout, SimpleRadioInput, _p} from 'mask';
import {attributeIn, element, enumParser, host, multi, NodeWithId, PersonaContext, renderCustomElement, stringParser, textContent} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, mapTo, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {$demoState} from '../state/getters/demo-state';
import {$targetAreas} from '../state/getters/region-state';
import {$addRegionSpecs} from '../state/setters/staging-state';
import {GRID_AREAS} from '../state/types/region-state';
import {RegionType} from '../state/types/region-type';

import {$documentationTemplate, DocumentationTemplate} from './documentation-template';
import template from './region-template.html';


const LOGGER = new Logger('pbd.RegionTemplate');


const $$ = {
  tag: 'pbd-region-template',
  api: {
    componentTag: attributeIn('component-tag', stringParser()),
    label: attributeIn('label', stringParser(), ''),
    regionType: attributeIn('region-type', enumParser<RegionType>(RegionType)),
  },
};


const $ = {
  addButton: element('addButton', $button, {}),
  host: host($$.api),
  selectedArea: element('selectedArea', $button, {}),
  selectedAreaLabel: element('selectedAreaLabel', $lineLayout, {
    text: textContent(),
  }),
  selectedAreaOverlay: element('selectedAreaOverlay', $overlayLayout, {
    contents: multi('#content'),
  }),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    Button,
    DocumentationTemplate,
    LineLayout,
    OverlayLayout,
    SimpleRadioInput,
  ],
  template,
})
export class RegionTemplate extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.handleOnAddClick$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.template.label(this.inputs.host.label),
      this.renderers.selectedAreaLabel.text(this.selectedArea$),
      this.renderers.selectedAreaOverlay.contents(this.selectedAreaOptions$),
      this.renderers.selectedAreaOverlay
          .showFn(this.inputs.selectedArea.actionEvent.pipe(mapTo([]))),
    ];
  }

  @cache()
  private get handleOnAddClick$(): Observable<unknown> {
    return this.inputs.addButton.actionEvent.pipe(
        withLatestFrom(
            $addRegionSpecs.get(this.vine),
            this.inputs.host.componentTag,
            this.inputs.host.regionType,
        ),
        tap(([, addRegionSpec, componentTag, regionType]) => {
          if (!addRegionSpec || !regionType || !componentTag) {
            return;
          }

          addRegionSpec[regionType](componentTag);
        }),
    );
  }

  @cache()
  private get selectedArea$(): Observable<string> {
    return combineLatest([
      $targetAreas.get(this.vine),
      this.inputs.host.regionType,
    ])
        .pipe(
            map(([targetAreas, regionType]) => {
              if (!targetAreas || !regionType) {
                return null;
              }

              return targetAreas[regionType];
            }),
            map(area => area === null ? 'Select grid area ...' : `Add to: ${GRID_AREAS[area]}`),
        );
  }

  @cache()
  private get selectedAreaOptions$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return combineLatest([
      $demoState.get(this.vine),
      this.inputs.host.regionType,
    ])
        .pipe(
            map(([demoState, regionType]) => {
              if (!demoState || !regionType) {
                return null;
              }

              return demoState.regionEditorState[regionType].$targetArea;
            }),
            switchMap(stateId => {
              if (!stateId) {
                return observableOf([]);
              }

              const gridArea$List = $pipe(
                  GRID_AREAS,
                  $zip(countableIterable()),
                  $map(([gridArea, index]) => {
                    return renderCustomElement(
                        $simpleRadioInput,
                        {
                          inputs: {
                            index: observableOf(index),
                            label: observableOf(`${gridArea}`),
                            stateId: observableOf(stateId),
                          },
                        },
                        index,
                        this.context,
                    );
                  }),
                  $asArray(),
              );

              return combineLatest(gridArea$List);
            }),
        );
  }
}

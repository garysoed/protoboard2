import {cache} from 'gs-tools/export/data';
import {$button, ACTION_EVENT, BaseThemedCtrl, Button, LineLayout, registerSvg, _p} from 'mask';
import {$section, attributeIn, element, enumParser, host, multi, onDom, PersonaContext, renderCustomElement, RenderSpec, stringParser} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import cardFront from '../asset/card_front.svg';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import {$editedFaces, $faceIcons} from '../state/getters/piece-state';
import {$setEditedFaces, $setFaces} from '../state/setters/piece-state';
import {$addPieceSpecs} from '../state/setters/staging-state';
import {FACE_ICONS} from '../state/types/piece-state';
import {PieceType} from '../state/types/piece-type';

import {$documentationTemplate as $documentationTemplate, DocumentationTemplate} from './documentation-template';
import {$pieceButton, ClickEvent as ClickButtonEvent, PieceButton} from './piece-button';
import {$piecePreview, ClickEvent as ClickPreviewEvent, PiecePreview} from './piece-preview';
import template from './piece-template.html';


export const $pieceTemplate = {
  tag: 'pbd-piece-template',
  api: {
    componentTag: attributeIn('component-tag', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    pieceType: attributeIn('piece-type', enumParser<PieceType>(PieceType)),
  },
};

const $ = {
  host: host($pieceTemplate.api),
  addButton: element('addbutton', $button, {}),
  editors: element('editors', $section, {
    content: multi('#content'),
    onClick: onDom<ClickButtonEvent>(ACTION_EVENT),
  }),
  previews: element('previews', $section, {
    content: multi('#content'),
    onClick: onDom<ClickPreviewEvent>(ACTION_EVENT),
  }),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$pieceTemplate,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});
    registerSvg(vine, 'card', {type: 'embed', content: cardFront});
  },
  dependencies: [
    Button,
    DocumentationTemplate,
    LineLayout,
    PieceButton,
    PiecePreview,
  ],
  template,
})
export class PieceTemplate extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.handleOnCustomizeClick$);
    this.addSetup(this.handlePreviewClick$);
    this.addSetup(this.handleAdd$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.template.label(this.inputs.host.label),
      this.renderers.previews.content(this.previewContents$),
      this.renderers.editors.content(this.editorContents$),
    ];
  }

  @cache()
  private get editorContents$(): Observable<readonly RenderSpec[]> {
    const icon$List = FACE_ICONS.map(icon => renderCustomElement({
      spec: $pieceButton,
      inputs: {icon},
      id: icon,
    }));

    return observableOf(icon$List);
  }

  @cache()
  private get handleAdd$(): Observable<unknown> {
    return this.inputs.addButton.actionEvent.pipe(
        withLatestFrom(
            this.inputs.host.pieceType,
            this.inputs.host.componentTag,
            $addPieceSpecs.get(this.vine),
        ),
        tap(([, pieceType, componentTag, addPieceSpecFn]) => {
          if (!addPieceSpecFn || !pieceType) {
            return;
          }
          addPieceSpecFn[pieceType](componentTag);
        }),
    );
  }

  @cache()
  private get handleOnCustomizeClick$(): Observable<unknown> {
    return this.inputs.editors.onClick
        .pipe(
            withLatestFrom(this.inputs.host.pieceType, $setFaces.get(this.vine)),
            tap(([{payload}, pieceType, setFace]) => {
              if (!pieceType || !setFace) {
                return;
              }
              setFace[pieceType](payload.icon);
            }),
        );
  }

  @cache()
  private get handlePreviewClick$(): Observable<unknown> {
    return this.inputs.previews.onClick.pipe(
        withLatestFrom(this.inputs.host.pieceType, $setEditedFaces.get(this.vine)),
        tap(([event, pieceType, setSelectedFaces]) => {
          if (!pieceType || !setSelectedFaces) {
            return;
          }

          setSelectedFaces[pieceType](event.payload.index);
        }),
    );
  }

  @cache()
  private get previewContents$(): Observable<readonly RenderSpec[]> {
    return this.previewIcons$.pipe(
        map(previewIcons => {
          return previewIcons.map((icon, index) => renderCustomElement({
            spec: $piecePreview,
            inputs: {
              icon,
              index,
            },
            attrs: new Map([
              [
                'mk-theme-highlight',
                this.selectedIndex$.pipe(
                    map(selectedIndex => selectedIndex === index ? '' : undefined),
                ),
              ],
            ]),
            id: `${index}-${icon}`,
          }));
        }),
    );
  }

  @cache()
  private get previewIcons$(): Observable<readonly string[]> {
    return combineLatest([$faceIcons.get(this.vine), this.inputs.host.pieceType]).pipe(
        map(([faceIcons, pieceType]) => {
          if (!faceIcons || !pieceType) {
            return [];
          }

          return faceIcons[pieceType];
        }),
    );
  }

  @cache()
  private get selectedIndex$(): Observable<number|null> {
    return combineLatest([
      this.inputs.host.pieceType,
      $editedFaces.get(this.vine),
    ])
        .pipe(
            map(([pieceType, selectedFaces]) => {
              if (!pieceType || !selectedFaces) {
                return null;
              }

              return selectedFaces[pieceType];
            }),
        );
  }
}

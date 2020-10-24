import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $button, _p, ACTION_EVENT, Button, LineLayout, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, enumParser, host, multi, NodeWithId, onDom, PersonaContext, renderCustomElement, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import cardFront from '../asset/card_front.svg';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';
import { $editedFaces, $faceIcons } from '../state/getters/piece-state';
import { $setEditedFaces, $setFaces } from '../state/setters/piece-state';
import { $addPieceSpecs } from '../state/setters/staging-state';
import { FACE_ICONS } from '../state/types/piece-state';
import { PieceType } from '../state/types/piece-type';

import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import { $pieceButton, ClickEvent as ClickButtonEvent, PieceButton } from './piece-button';
import { $piecePreview, ClickEvent as ClickPreviewEvent, PiecePreview } from './piece-preview';
import template from './piece-template.html';


const LOGGER = new Logger('pbd.PieceTemplate');


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
  editors: element('editors', instanceofType(HTMLElement), {
    content: multi('#content'),
    onClick: onDom<ClickButtonEvent>(ACTION_EVENT),
  }),
  previews: element('previews', instanceofType(HTMLElement), {
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
export class PieceTemplate extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleOnCustomizeClick$);
    this.addSetup(this.handlePreviewClick$);
    this.addSetup(this.handleAdd$);
    this.render($.template._.label, this.declareInput($.host._.label));
    this.render($.previews._.content, this.previewContents$);
    this.render($.editors._.content, this.editorContents$);
  }

  @cache()
  private get editorContents$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    const icon$List = FACE_ICONS.map(icon => renderCustomElement(
        $pieceButton,
        {inputs: {icon: observableOf(icon)}},
        icon,
        this.context,
    ));

    return icon$List.length <= 0 ? observableOf([]) : combineLatest(icon$List);
  }

  @cache()
  private get handleAdd$(): Observable<unknown> {
    return this.declareInput($.addButton._.actionEvent).pipe(
        withLatestFrom(
            this.declareInput($.host._.pieceType),
            this.declareInput($.host._.componentTag),
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
    return this.declareInput($.editors._.onClick)
        .pipe(
            withLatestFrom(this.declareInput($.host._.pieceType), $setFaces.get(this.vine)),
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
    return this.declareInput($.previews._.onClick).pipe(
        withLatestFrom(this.declareInput($.host._.pieceType), $setEditedFaces.get(this.vine)),
        tap(([event, pieceType, setSelectedFaces]) => {
          if (!pieceType || !setSelectedFaces) {
            return;
          }

          setSelectedFaces[pieceType](event.payload.index);
        }),
    );
  }

  @cache()
  private get previewContents$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return this.previewIcons$.pipe(
        switchMap(previewIcons => {
          const node$List = previewIcons.map((icon, index) => renderCustomElement(
              $piecePreview,
              {
                inputs: {
                  icon: observableOf(icon),
                  index: observableOf(index),
                },
                attrs: new Map([
                  [
                    'mk-theme-highlight',
                    this.selectedIndex$.pipe(
                        map(selectedIndex => selectedIndex === index ? '' : null),
                    ),
                  ],
                ]),
              },
              `${index}-${icon}`,
              this.context,
          ));

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }

  @cache()
  private get previewIcons$(): Observable<readonly string[]> {
    return combineLatest([$faceIcons.get(this.vine), this.declareInput($.host._.pieceType)]).pipe(
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
      this.declareInput($.host._.pieceType),
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

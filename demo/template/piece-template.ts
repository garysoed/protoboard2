import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $textIconButton, _p, ACTION_EVENT, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, integerParser, multi, onDom, PersonaContext, renderCustomElement, stringParser } from 'persona';
import { BehaviorSubject, combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import cardFront from '../asset/card_front.svg';
import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { ADD_PIECE_EVENT, AddPieceEvent } from './add-piece-event';
import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import { $pieceButton, ClickEvent as ClickButtonEvent, PieceButton } from './piece-button';
import { $piecePreview, ClickEvent as ClickPreviewEvent, PiecePreview } from './piece-preview';
import template from './piece-template.html';


const LOGGER = new Logger('pbd.PieceTemplate');


export const $pieceTemplate = {
  tag: 'pbd-piece-template',
  api: {
    faceCount: attributeIn('face-count', integerParser()),
    label: attributeIn('label', stringParser(), ''),
    onAdd: dispatcher<AddPieceEvent>(ADD_PIECE_EVENT),
  },
};

const $ = {
  host: host($pieceTemplate.api),
  addButton: element('addbutton', $textIconButton, {}),
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

const ICONS = ['meeple', 'coin', 'gem', 'card'];

@_p.customElement({
  ...$pieceTemplate,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});
    registerSvg(vine, 'card', {type: 'embed', content: cardFront});
  },
  dependencies: [
    DocumentationTemplate,
    PieceButton,
    PiecePreview,
    TextIconButton,
  ],
  template,
})
export class PieceTemplate extends ThemedCustomElementCtrl {
  private readonly selectedIndex$ = new BehaviorSubject<number>(0);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleOnCustomizeClick$);
    this.addSetup(this.handlePreviewClick$);
    this.render($.template._.label, this.declareInput($.host._.label));
    this.render($.previews._.content, this.previewContents$);
    this.render($.editors._.content, this.editorContents$);
    this.render($.host._.onAdd, this.onAdd$);
  }

  @cache()
  private get actualFaceCount$(): Observable<number> {
    return this.declareInput($.host._.faceCount).pipe(
        map(faceCount => faceCount ?? 0),
    );
  }

  @cache()
  private get editorContents$(): Observable<readonly Node[]> {
    const icon$List = ICONS.map(icon => renderCustomElement(
        $pieceButton,
        {inputs: {icon: observableOf(icon)}},
        this.context,
    ));

    return icon$List.length <= 0 ? observableOf([]) : combineLatest(icon$List);
  }

  @cache()
  private get handleOnCustomizeClick$(): Observable<unknown> {
    return this.declareInput($.editors._.onClick)
    .pipe(
        withLatestFrom(this.previewIcons$, this.selectedIndex$),
        tap(([{payload}, previewIcons, selectedIcon]) => {
          previewIcons[selectedIcon % previewIcons.length].next(payload.icon);
        }),
    );
  }

  @cache()
  private get handlePreviewClick$(): Observable<unknown> {
    return this.declareInput($.previews._.onClick).pipe(
        tap(event => {
          this.selectedIndex$.next(event.payload.index);
        }),
    );
  }

  @cache()
  private get onAdd$(): Observable<AddPieceEvent> {
    return this.declareInput($.addButton._.actionEvent).pipe(
        withLatestFrom(this.previewIcons$),
        map(([, previewIcons]) => {
          const icons = previewIcons.map(preview => preview.getValue());
          return new AddPieceEvent(icons);
        }),
    );
  }

  @cache()
  private get previewContents$(): Observable<readonly Node[]> {
    return this.previewIcons$.pipe(
        switchMap(previewIcons => {
          const node$List = previewIcons.map((icon$, index) => renderCustomElement(
              $piecePreview,
              {
                inputs: {
                  icon: icon$,
                  index: observableOf(index),
                  selected: this.selectedIndex$.pipe(
                      map(selectedIndex => selectedIndex === index),
                  ),
                },
              },
              this.context,
          ));

          return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
        }),
    );
  }

  @cache()
  private get previewIcons$(): Observable<ReadonlyArray<BehaviorSubject<string>>> {
    return this.actualFaceCount$.pipe(
        map(faceCount => {
          const icons = [];
          for (let i = 0; i < faceCount; i++) {
            icons.push(new BehaviorSubject(ICONS[i % ICONS.length]));
          }

          return icons;
        }),
        // Needed because of the BehaviorSubject.
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }
}

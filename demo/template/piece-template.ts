import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $textIconButton, _p, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, integerParser, multi, PersonaContext, renderCustomElement, stringParser } from 'persona';
import { BehaviorSubject, combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { ADD_PIECE_EVENT, AddPieceEvent } from './add-piece-event';
import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import { $pieceButton, PieceButton } from './piece-button';
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
  meepleButton: element('meeple', $pieceButton, {}),
  coinButton: element('coin', $pieceButton, {}),
  gemButton: element('gem', $pieceButton, {}),
  previews: element('previews', instanceofType(HTMLElement), {
    content: multi('#content'),
  }),
  template: element('template', $documentationTemplate, {}),
};

const ICONS = ['meeple', 'coin', 'gen'];

@_p.customElement({
  ...$pieceTemplate,
  configure: vine => {
    registerSvg(vine, 'meeple', {type: 'embed', content: meepleSvg});
    registerSvg(vine, 'coin', {type: 'embed', content: coinSvg});
    registerSvg(vine, 'gem', {type: 'embed', content: gemSvg});
  },
  dependencies: [
    DocumentationTemplate,
    PieceButton,
    TextIconButton,
  ],
  template,
})
export class PieceTemplate extends ThemedCustomElementCtrl {
  private readonly selectedIndex$ = new BehaviorSubject<number>(0);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleOnCustomizeClick$);
    this.render($.template._.label, this.declareInput($.host._.label));
    this.render($.previews._.content, this.previewContents$);
    this.render($.host._.onAdd, this.onAdd$);
  }

  @cache()
  private get actualFaceCount$(): Observable<number> {
    return this.declareInput($.host._.faceCount).pipe(
        map(faceCount => faceCount ?? 0),
    );
  }

  @cache()
  private get handleOnCustomizeClick$(): Observable<unknown> {
    return merge(
        this.declareInput($.coinButton._.onClick),
        this.declareInput($.gemButton._.onClick),
        this.declareInput($.meepleButton._.onClick),
    )
    .pipe(
        withLatestFrom(this.previewIcons$, this.selectedIndex$),
        tap(([{payload}, previewIcons, selectedIcon]) => {
          previewIcons[selectedIcon].next(payload.icon);
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
          const node$List = previewIcons.map(icon$ => renderCustomElement(
              $pieceButton,
              {inputs: {icon: icon$}},
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

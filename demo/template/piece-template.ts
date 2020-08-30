import { cache } from 'gs-tools/export/data';
import { $icon, $textIconButton, _p, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { ADD_PIECE_EVENT, AddPieceEvent } from './add-piece-event';
import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import { $pieceButton, PieceButton } from './piece-button';
import template from './piece-template.html';


export const $pieceTemplate = {
  tag: 'pbd-piece-template',
  api: {
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
  previewIcon: element('previewIcon', $icon, {}),
  template: element('template', $documentationTemplate, {}),
};

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
  private readonly selectedIcon$ = new BehaviorSubject<string>('meeple');

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleOnCustomizeClick$);
    this.render($.template._.label, this.declareInput($.host._.label));
    this.render($.previewIcon._.icon, this.selectedIcon$);
    this.render($.host._.onAdd, this.onAdd$);
  }

  @cache()
  private get handleOnCustomizeClick$(): Observable<unknown> {
    return merge(
        this.declareInput($.coinButton._.onClick),
        this.declareInput($.gemButton._.onClick),
        this.declareInput($.meepleButton._.onClick),
    )
    .pipe(tap(({payload}) => this.selectedIcon$.next(payload.icon)));
  }

  @cache()
  private get onAdd$(): Observable<AddPieceEvent> {
    return this.declareInput($.addButton._.actionEvent).pipe(
        withLatestFrom(this.selectedIcon$),
        map(([, selectedIcon]) => new AddPieceEvent([selectedIcon])),
    );
  }
}

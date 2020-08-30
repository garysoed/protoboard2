import { cache } from 'gs-tools/export/data';
import { filterNonNull, mapNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType } from 'gs-types';
import { $icon, $textIconButton, _p, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, onDom, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import coinSvg from '../asset/coin.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import { ADD_PIECE_EVENT, AddPieceEvent } from './add-piece-event';
import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
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
  customize: element('customize', elementWithTagType('section'), {
    onClick: onDom('click'),
  }),
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
    return this.declareInput($.customize._.onClick)
        .pipe(
            map(event => event.target),
            mapNonNull(target => {
              if (!(target instanceof Element)) {
                return null;
              }

              if (!target.classList.contains('bigButton')) {
                return null;
              }

              return target.id;
            }),
            filterNonNull(),
            tap(icon => this.selectedIcon$.next(icon)),
        );
  }

  @cache()
  private get onAdd$(): Observable<AddPieceEvent> {
    return this.declareInput($.addButton._.actionEvent).pipe(
        withLatestFrom(this.selectedIcon$),
        map(([, selectedIcon]) => new AddPieceEvent([selectedIcon])),
    );
  }
}

import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {$icon, _p, ACTION_EVENT, ActionEvent, ThemedCustomElementCtrl} from 'mask';
import {attributeIn, dispatcher, element, host, integerParser, onDom, PersonaContext, stringParser} from 'persona';
import {EMPTY, Observable, of as observableOf} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';

import template from './piece-preview.html';


export type ClickEvent = ActionEvent<{readonly index: number}>;

export const $piecePreview = {
  tag: 'pbd-piece-preview',
  api: {
    icon: attributeIn('icon', stringParser(), ''),
    index: attributeIn('index', integerParser()),
    onClick: dispatcher<ClickEvent>(ACTION_EVENT),
  },
};

const $ = {
  host: host($piecePreview.api),
  icon: element('icon', $icon, {}),
  root: element('root', instanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$piecePreview,
  template,
})
export class PiecePreview extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.icon._.icon, this.declareInput($.host._.icon));
    this.render($.host._.onClick, this.onClick$);
  }

  @cache()
  private get onClick$(): Observable<ClickEvent> {
    return this.declareInput($.root._.onClick).pipe(
        withLatestFrom(this.declareInput($.host._.index)),
        switchMap(([, index]) => {
          if (index === undefined) {
            return EMPTY;
          }
          return observableOf(new ActionEvent({index}));
        }),
    );
  }
}
